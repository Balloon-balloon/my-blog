  // Update sequences
  const maxIds = {};
  for (const table of ["User", "Category", "Post", "Tag", "Comment", "Like", "Favorite"]) {
    const items = seedData[table] || [];
    if (items.length > 0) {
      const maxId = Math.max(...items.map(i => i.id));
      sqls.push("SELECT setval('" + table + "_id_seq', " + maxId + ", true)");
    }
  }
