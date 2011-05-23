(function () {
  "use strict";

  // http://www.html5rocks.com/tutorials/#file
  // http://www.html5rocks.com/tutorials/#filereader
  // http://www.html5rocks.com/tutorials/#filewriter
  // http://www.html5rocks.com/tutorials/#filesystem

  var FileApi = {
    // FormData
    // http://www.w3.org/TR/XMLHttpRequest2/
    "FormData": window.FormData,
    // File API
    // http://www.w3.org/TR/FileAPI/
    // http://www.w3.org/TR/file-upload/
    "FileList": window.FileList,
    "Blob": window.Blob,
    "File": window.File,
    "FileReader": window.FileReader,
    "FileError": window.FileError,
    // File API: Writer
    // http://www.w3.org/TR/file-writer-api/
    "BlobBuilder": window.BlobBuilder,
    "FileSaver": window.FileSaver,
    "FileSaverSync": window.FileSaverSync,
    "FileWriter": window.FileWriter,
    "FileWriterSync": window.FileWriterSync,
    // File API: Directories and System
    // http://www.w3.org/TR/file-system-api/
    // implemented by Window and WorkerGlobalScope
    "LocalFileSystem": window.LocalFileSystem,
      // requestFileSystem(type, size, successCallback, opt_errorCallback)
      "requestFileSystem": window.requestFileSystem || window.webkitRequestFileSystem,
      // resolveLocalFileSystemURL
    "LocalFileSystemSync": window.LocalFileSystemSync,
      // Asychronous FileSystem API
    "Metadata": window.Metadata,
    "Flags": window.Flags,
    "FileSystem": window.FileSystem,
    "Entry": window.Entry,
    "DirectoryEntry": window.DirectoryEntry,
    "DirectoryReader": window.DirectoryReader,
    "FileEntry": window.FileEntry,
      // Synchronous FileSystem API
    "FileSystemSync": window.FileSystemSync,
    "EntrySync": window.EntrySync,
    "DirectoryEntrySync": window.DirectoryEntrySync,
    "DirectoryReaderSync": window.DirectoryReaderSync,
    "FileEntrySync": window.FileEntrySync,
    //"FileError": window.FileError,
  };

  module.exports = FileApi;
  provide('file-api', module.exports);
}());
