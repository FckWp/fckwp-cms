onRecordCreate((e) => {
  function slugify(text) {
    return text
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
  if (!e.record.get("slug") && e.record.get("title")) {
    e.record.set("slug", slugify(e.record.get("title")));
  }
  e.next();
});
