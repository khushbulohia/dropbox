## Dropbox

This is a basic Dropbox clone to sync files across multiple remote folders.

Time spent: `4 hours`

### Features

#### Required


- [x] Client can make GET requests to get file or directory contents
- [x] Client can download a directory as an archive
- [x] Client can make HEAD request to get just the GET headers
- [x] Client can make PUT requests to create new directories and files with content
- [x] Client can make POST requests to update the contents of a file
- [x] Client can make DELETE requests to delete files and folders
- [ ] Server will serve from `--dir` or cwd as root
- [x] Server will sync `HTTP` modifications over TCP to the Client
- [x] Server will sync watched file modifications (e.g., `fs.watch`) over TCP to the Client

### Optional

- [ ] Client supports multiple connected clients
- [x] Client does not need to make additional `GET` request on `"write"` update
- [ ] Client and User will be redirected from HTTP to HTTPS
- [x] Client will sync back to Server over TCP
- [ ] Client will preserve a 'Conflict' file when pushed changes preceeding local edits
- [ ] Client can stream and scrub video files (e.g., on iOS)
- [ ] Client can create a directory with an archive
- [ ] User can connect to the server using an FTP client


### Walkthrough

![Video Walkthrough](dropbox.gif)
