import zipfile

z = zipfile.ZipFile("apps/web/deploy.zip")
names = z.namelist()

print("=== Files in deploy.zip (first 25) ===")
for n in sorted(names)[:25]:
    print(" ", n)

print()

html = z.read("index.html").decode("utf-8")
has_next = "/next/static/css" in html
has_underscore_next = "/_next" in html
has_relative_next = "./_next" in html

print("=== CSS Path Check ===")
print(f"  Has /next/static/css: {has_next}")
print(f"  Has /_next (bad):     {has_underscore_next}")
print(f"  Has ./_next (bad):    {has_relative_next}")
