import io
p = r"tools\audit_content_ui.py"
c = io.open(p, encoding="utf-8").read()
c = c.replace("tot_tab", "tot_tables")
io.open(p, "w", encoding="utf-8").write(c)
print("all occurrences renamed:", "tot_tab" not in c)
