# Integration tests
- Create, rename, and delete a book: BookList
- Create, rename, and delete a chapter: ChapterList
- Edit a chapter's title and text, test auto-save: Editor
- Edit a chapter's text, save, switch to another chapter, then switch back. Your edits should be there (issue #7): EditAndSwitch
- Should be able to go to grid mode and go back: GridMode
- Can hide and show prompts and sidebar panels using their icons. Pressing escape hides and shows the user interface. Pressing command shift P hides and shows the launcher: UI
- Logging in works: Login
- Home page loads: Home
- Manually saving should create a new history element. Editing and saving again should create another element with a diff. Clicking the older element should restore that state, but not create another entry in the history ; History

## TODO
- Reordering chapters
- Clicking a prompt fetches ai suggestions
- focus mode
- editing a prompt in settings
- full screen mode
- close chapter/book by clicking X
- if chapter/book is closed, you can click the arrow to open