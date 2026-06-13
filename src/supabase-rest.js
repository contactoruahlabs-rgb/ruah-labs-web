// RUAH LABS — Cliente Supabase REST (fetch nativo, sin CDN)
(function () {
  var BASE = 'https://txrpxzsqqomdlnxmyvxn.supabase.co/rest/v1';
  var ANON = 'sb_publishable_ZLrj11-7GjIE8gEiwybtvQ_6e4NZ07p';
  function headers(key) {
    return {
      'apikey': key,
      'Authorization': 'Bearer ' + key,
      'Content-Type': 'application/json'
    };
  }

  function client(key) {
    return {
      from: function (tbl) {
        return {
          // SELECT col WHERE field = val LIMIT 1
          select: function (cols) {
            return {
              eq: function (col, val) {
                return {
                  single: function () {
                    var url = BASE + '/' + tbl + '?select=' + (cols || '*') +
                              '&' + col + '=eq.' + encodeURIComponent(val) + '&limit=1';
                    return fetch(url, { headers: headers(key) })
                      .then(function (r) { return r.json(); })
                      .then(function (rows) { return { data: (rows && rows[0]) || null, error: null }; })
                      .catch(function (e) { return { data: null, error: e }; });
                  }
                };
              }
            };
          },
          // INSERT
          insert: function (row) {
            return fetch(BASE + '/' + tbl, {
              method: 'POST',
              headers: Object.assign({}, headers(key), { 'Prefer': 'return=minimal' }),
              body: JSON.stringify(row)
            })
              .then(function (r) { return r.ok ? { error: null } : r.json().then(function (e) { return { error: e }; }); })
              .catch(function (e) { return { error: e }; });
          },
          // UPSERT (merge-duplicates)
          upsert: function (row) {
            return fetch(BASE + '/' + tbl, {
              method: 'POST',
              headers: Object.assign({}, headers(key), { 'Prefer': 'return=minimal,resolution=merge-duplicates' }),
              body: JSON.stringify(row)
            })
              .then(function (r) { return r.ok ? { error: null } : r.json().then(function (e) { return { error: e }; }); })
              .catch(function (e) { return { error: e }; });
          }
        };
      }
    };
  }

  window.ruahDb = client(ANON); // anon key: lecturas públicas + inserts permitidos por RLS
})();
