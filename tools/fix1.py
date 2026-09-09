import io
p = r"app\js\modules\psychro.js"
c = io.open(p, encoding="utf-8").read()
bad = "  }));\n, { collapsed: true }));"
good = "  }, { collapsed: true }));"
assert bad in c, "bad seq not found"
c = c.replace(bad, good, 1)
io.open(p, "w", encoding="utf-8").write(c)
print("fixed, folded:", c.count("collapsed: true"))
