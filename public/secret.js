/* global React */
// ============================================================
// RUAH LABS — SecretPortal v3
// Triple-click on top logo →
//   (1) 2s STATIC TV NOISE (canvas animado + audio)
//   (2) Video fullscreen muted, pausa en PAUSE_AT_S
//   (3) Login modal (email + password)
//   (4) After login: modal cierra, video reanuda CON sonido
//   (5) When video ends: portal cierra & Club se abre
// ============================================================

const STATIC_MS = 2200; // duración de la estática (ms)
const PAUSE_AT_S = 3.45; // video pausa aquí para el login

function SecretPortal() {
  // phase: 'idle' | 'static' | 'video' | 'login'
  const [phase, setPhase] = React.useState('idle');
  const [email, setEmail] = React.useState('');
  const [pass, setPass] = React.useState('');
  const [shake, setShake] = React.useState(false);
  const [loginErr, setLoginErr] = React.useState('');
  const [loginBusy, setLoginBusy] = React.useState(false);
  const [loginVisible, setLoginVisible] = React.useState(false);
  const [changingPass, setChangingPass] = React.useState(false);
  const [newPass, setNewPass] = React.useState('');
  const [newPass2, setNewPass2] = React.useState('');
  const [changeErr, setChangeErr] = React.useState('');
  const memberRef = React.useRef(null); // { name, email } tras login

  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const timersRef = React.useRef([]);
  const audioCtxRef = React.useRef(null);
  const noiseNodeRef = React.useRef(null);
  const gainNodeRef = React.useRef(null);
  const pauseGuardRef = React.useRef(false);
  const loggedInRef = React.useRef(false);

  // ---- escuchar triple-click en el logo ----
  React.useEffect(() => {
    const onTrigger = () => {
      if (phase !== 'idle') return;
      startSequence();
    };
    window.addEventListener('ruah:triggerSecret', onTrigger);
    return () => window.removeEventListener('ruah:triggerSecret', onTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- ESC para cerrar ----
  React.useEffect(() => {
    if (phase === 'idle') return;
    const onKey = e => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  // ---- bloquear scroll ----
  React.useEffect(() => {
    document.body.style.overflow = phase === 'idle' ? '' : 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);
  function clearTimers() {
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];
  }

  // ============================================================
  // Canvas TV static
  // ============================================================
  function startCanvasStatic() {
    var canvas = canvasRef.current;
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var SW = Math.ceil(window.innerWidth / 3);
    var SH = Math.ceil(window.innerHeight / 3);
    canvas.width = SW;
    canvas.height = SH;
    var imgData = ctx.createImageData(SW, SH);
    var data = imgData.data;
    var scanY = 0;
    function drawFrame() {
      for (var i = 0; i < data.length; i += 4) {
        if (Math.random() < 0.6) {
          var v = Math.random() < 0.08 ? 255 : Math.floor(Math.random() * 200);
          data[i] = data[i + 1] = data[i + 2] = v;
          data[i + 3] = 255;
        }
      }
      ctx.putImageData(imgData, 0, 0);
      ctx.fillStyle = 'rgba(255,255,255,0.06)';
      ctx.fillRect(0, scanY % SH, SW, 2);
      scanY += 3;
      if (Math.random() < 0.04) {
        ctx.fillStyle = 'rgba(236,161,12,0.07)';
        ctx.fillRect(0, 0, SW, SH);
      }
      rafRef.current = requestAnimationFrame(drawFrame);
    }
    drawFrame();
  }
  function stopCanvasStatic() {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }

  // ============================================================
  // Web Audio — ruido de TV
  // ============================================================
  function playStaticNoise(durationMs) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      audioCtxRef.current = ctx;
      const bufferSize = 2 * ctx.sampleRate;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 800;
      const bandpass = ctx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.value = 3200;
      bandpass.Q.value = 0.5;
      const gain = ctx.createGain();
      gain.gain.value = 0.0001;
      noise.connect(highpass);
      highpass.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(ctx.destination);
      noiseNodeRef.current = noise;
      gainNodeRef.current = gain;
      const now = ctx.currentTime;
      const dur = durationMs / 1000;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.55, now + 0.04);
      gain.gain.setValueAtTime(0.55, now + Math.max(0.04, dur - 0.12));
      gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      noise.start(now);
      noise.stop(now + dur + 0.05);
      noise.onended = () => {
        try {
          ctx.close();
        } catch (_) {}
        audioCtxRef.current = null;
      };
    } catch (err) {
      console.warn('Static noise unavailable:', err);
    }
  }
  function stopStaticNoise() {
    try {
      if (gainNodeRef.current && audioCtxRef.current) {
        const now = audioCtxRef.current.currentTime;
        gainNodeRef.current.gain.cancelScheduledValues(now);
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      }
      if (noiseNodeRef.current) {
        try {
          noiseNodeRef.current.stop(audioCtxRef.current.currentTime + 0.1);
        } catch (_) {}
      }
    } catch (_) {}
  }

  // ============================================================
  // Secuencia principal
  // ============================================================
  function startSequence() {
    clearTimers();
    loggedInRef.current = false;
    pauseGuardRef.current = false;

    // Fase 1: ESTÁTICA — canvas animado + audio
    setPhase('static');
    playStaticNoise(STATIC_MS);
    requestAnimationFrame(startCanvasStatic);

    // Pre-cargar el video: reintenta hasta que el DOM lo tenga (está oculto durante 'static')
    var armVideo = function () {
      var v = videoRef.current;
      if (!v) {
        timersRef.current.push(setTimeout(armVideo, 20));
        return;
      }
      try {
        v.muted = true;
        v.currentTime = 0;
        v.load();
      } catch (_) {}
    };
    timersRef.current.push(setTimeout(armVideo, 30));

    // Al terminar la estática: corte directo al video
    timersRef.current.push(setTimeout(function () {
      stopCanvasStatic();
      setPhase('video');
      requestAnimationFrame(function () {
        var v = videoRef.current;
        if (!v) return;
        try {
          v.currentTime = 0;
          v.muted = true;
        } catch (_) {}
        var p = v.play();
        if (p && p.catch) p.catch(function () {
          var retry = function () {
            v.play().catch(function () {});
            window.removeEventListener('click', retry);
          };
          window.addEventListener('click', retry, {
            once: true
          });
        });
      });
    }, STATIC_MS));
  }

  // Pausa el video en PAUSE_AT_S → muestra login
  function onVideoTimeUpdate() {
    var v = videoRef.current;
    if (!v) return;
    if (!loggedInRef.current && !pauseGuardRef.current && v.currentTime >= PAUSE_AT_S) {
      pauseGuardRef.current = true;
      try {
        v.pause();
      } catch (_) {}
      timersRef.current.push(setTimeout(function () {
        setPhase('login');
        setTimeout(function () {
          setLoginVisible(true);
        }, 20);
      }, 120));
    }
  }
  function onLoginSubmit(e) {
    e.preventDefault();
    setLoginErr('');
    setLoginBusy(true);
    fetch('' + window.RUAH_API + '/api/club/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        password: pass
      })
    }).then(function (r) {
      return r.json();
    }).then(function (data) {
      setLoginBusy(false);
      if (data.error) {
        setLoginErr(data.error);
        setShake(true);
        setTimeout(function () {
          setShake(false);
        }, 600);
        return;
      }
      // Login OK
      memberRef.current = {
        name: data.name,
        email: data.email
      };
      try {
        sessionStorage.setItem('ruah-club-auth', '1');
        sessionStorage.setItem('ruah-club-email', data.email);
        sessionStorage.setItem('ruah-club-name', data.name || '');
      } catch (_) {}
      if (data.must_change_password) {
        // Mostrar pantalla de cambio de contraseña antes de entrar
        setChangingPass(true);
        return;
      }

      // Entrar directo
      loggedInRef.current = true;
      setLoginVisible(false);
      setTimeout(function () {
        setPhase('video');
        var v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.volume = 1.0;
        v.play().catch(function () {});
      }, 350);
    }).catch(function () {
      setLoginBusy(false);
      setLoginErr('Error de conexión con el servidor.');
    });
  }
  function onChangePasswordSubmit(e) {
    e.preventDefault();
    setChangeErr('');
    if (newPass !== newPass2) {
      setChangeErr('Las contraseñas no coinciden');
      return;
    }
    if (newPass.length < 8) {
      setChangeErr('Mínimo 8 caracteres');
      return;
    }
    fetch('' + window.RUAH_API + '/api/club/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        oldPassword: pass,
        newPassword: newPass
      })
    }).then(function (r) {
      return r.json();
    }).then(function (data) {
      if (data.error) {
        setChangeErr(data.error);
        return;
      }
      // Contraseña cambiada → entrar al club
      loggedInRef.current = true;
      setChangingPass(false);
      setLoginVisible(false);
      setTimeout(function () {
        setPhase('video');
        var v = videoRef.current;
        if (!v) return;
        v.muted = false;
        v.volume = 1.0;
        v.play().catch(function () {});
      }, 350);
    }).catch(function () {
      setChangeErr('Error de conexión.');
    });
  }
  function onVideoEnded() {
    close({
      openClub: true
    });
  }
  function close(opts) {
    clearTimers();
    stopStaticNoise();
    stopCanvasStatic();
    var v = videoRef.current;
    if (v) {
      try {
        v.pause();
      } catch (_) {}
    }
    setPhase('idle');
    setLoginVisible(false);
    setEmail('');
    setPass('');
    if (opts && opts.openClub) {
      window.dispatchEvent(new CustomEvent('ruah:openClub'));
    }
  }
  if (phase === 'idle') return null;
  return /*#__PURE__*/React.createElement("div", {
    className: 'sp3 sp3-phase-' + phase
  }, phase === 'static' && /*#__PURE__*/React.createElement("div", {
    className: "sp3-static",
    "aria-hidden": "true"
  }, /*#__PURE__*/React.createElement("canvas", {
    ref: canvasRef,
    className: "sp3-static__canvas"
  }), /*#__PURE__*/React.createElement("div", {
    className: "sp3-static__dot"
  })), (phase === 'static' || phase === 'video' || phase === 'login') && /*#__PURE__*/React.createElement("div", {
    className: "sp3-video-wrap",
    style: phase === 'static' ? {
      opacity: 0,
      pointerEvents: 'none',
      position: 'absolute'
    } : null,
    "aria-hidden": phase !== 'video' ? 'true' : 'false'
  }, /*#__PURE__*/React.createElement("video", {
    ref: videoRef,
    className: "sp3-video",
    src: "assets/secret-portal.mp4",
    playsInline: true,
    preload: "auto",
    onTimeUpdate: onVideoTimeUpdate,
    onEnded: onVideoEnded,
    onClick: function (e) {
      var v = e.currentTarget;
      if (v.paused && phase === 'video' && loggedInRef.current) v.play().catch(function () {});
    }
  }), phase === 'video' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "sp3-hud"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sp3-hud__rec"
  }), /*#__PURE__*/React.createElement("span", null, "REC \xB7 TRANSMISI\xD3N PRIVADA \xB7 RUAH LABS")), /*#__PURE__*/React.createElement("button", {
    className: "sp3-close",
    onClick: function () {
      close();
    },
    "aria-label": "Cerrar"
  }, "\xD7"))), phase === 'login' && /*#__PURE__*/React.createElement("div", {
    className: 'sp3-login-wrap' + (loginVisible ? ' visible' : '')
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login-bg",
    "aria-hidden": "true"
  }), /*#__PURE__*/React.createElement("button", {
    className: "sp3-close sp3-close--login",
    onClick: function () {
      close();
    },
    "aria-label": "Cerrar"
  }, "\xD7"), !changingPass ? /*#__PURE__*/React.createElement("form", {
    className: 'sp3-login' + (shake ? ' shake' : ''),
    onSubmit: onLoginSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sp3-login__brandDot"
  }), /*#__PURE__*/React.createElement("span", null, "RUAH\xA0LABS \xB7 CLUB")), /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__tag"
  }, "\xA7 ACCESO PRIVADO"), /*#__PURE__*/React.createElement("h2", {
    className: "sp3-login__title"
  }, "BIENVENIDO", /*#__PURE__*/React.createElement("br", null), "AL MOVIMIENTO."), /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__sub"
  }, "Identif\xEDcate para entrar al protocolo.", /*#__PURE__*/React.createElement("br", null), "Tus credenciales llegaron a tu correo.")), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "EMAIL"), /*#__PURE__*/React.createElement("input", {
    type: "email",
    required: true,
    value: email,
    onChange: function (e) {
      setEmail(e.target.value);
      setLoginErr('');
    },
    placeholder: "tu@correo.cl",
    autoFocus: true,
    autoComplete: "email"
  })), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "CONTRASE\xD1A"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    value: pass,
    onChange: function (e) {
      setPass(e.target.value);
      setLoginErr('');
    },
    placeholder: "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022",
    autoComplete: "current-password"
  })), loginErr && /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__err"
  }, loginErr), /*#__PURE__*/React.createElement("button", {
    className: "sp3-submit",
    type: "submit",
    disabled: loginBusy
  }, loginBusy ? 'VERIFICANDO…' : 'ENTRAR AL CLUB', !loginBusy && /*#__PURE__*/React.createElement("span", {
    className: "sp3-submit__arr"
  }, "\u2192")), /*#__PURE__*/React.createElement("p", {
    className: "sp3-foot"
  }, "SOMOS M\xC1S DE LOS QUE CREES.", /*#__PURE__*/React.createElement("small", null, "ESC o \xD7 para salir"))) : /*#__PURE__*/React.createElement("form", {
    className: "sp3-login",
    onSubmit: onChangePasswordSubmit
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__head"
  }, /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__brand"
  }, /*#__PURE__*/React.createElement("span", {
    className: "sp3-login__brandDot"
  }), /*#__PURE__*/React.createElement("span", null, "RUAH\xA0LABS \xB7 CLUB")), /*#__PURE__*/React.createElement("div", {
    className: "sp3-login__tag"
  }, "\xA7 PRIMER ACCESO"), /*#__PURE__*/React.createElement("h2", {
    className: "sp3-login__title"
  }, "ELIGE TU", /*#__PURE__*/React.createElement("br", null), "CONTRASE\xD1A."), /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__sub"
  }, "Por seguridad, debes cambiar tu contrase\xF1a inicial", /*#__PURE__*/React.createElement("br", null), "antes de entrar al club.")), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "NUEVA CONTRASE\xD1A"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    minLength: 8,
    value: newPass,
    onChange: function (e) {
      setNewPass(e.target.value);
      setChangeErr('');
    },
    placeholder: "M\xEDnimo 8 caracteres",
    autoFocus: true
  })), /*#__PURE__*/React.createElement("label", {
    className: "sp3-field"
  }, /*#__PURE__*/React.createElement("span", null, "CONFIRMAR CONTRASE\xD1A"), /*#__PURE__*/React.createElement("input", {
    type: "password",
    required: true,
    minLength: 8,
    value: newPass2,
    onChange: function (e) {
      setNewPass2(e.target.value);
      setChangeErr('');
    },
    placeholder: "Repite la contrase\xF1a"
  })), changeErr && /*#__PURE__*/React.createElement("p", {
    className: "sp3-login__err"
  }, changeErr), /*#__PURE__*/React.createElement("button", {
    className: "sp3-submit",
    type: "submit"
  }, "GUARDAR Y ENTRAR", /*#__PURE__*/React.createElement("span", {
    className: "sp3-submit__arr"
  }, "\u2192")))));
}
Object.assign(window, {
  SecretPortal
});