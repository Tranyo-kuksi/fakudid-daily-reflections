
// Find the search button in the form and update its variant
<form onSubmit={handleSearch} className="flex gap-2 mb-8">
  <Input
    placeholder="Search entries by text, title or date..."
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
    className="flex-1"
  />
  <Button type="submit" variant="themeDark" className="px-3">
    <Search className="h-5 w-5" />
  </Button>
</form>
