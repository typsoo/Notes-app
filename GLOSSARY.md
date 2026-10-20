# Notes App

A workspace-based note-taking application where people write and organize editable documents.

## Language

**Workspace**:
A membership-scoped container that holds a set of Folders and Documents.
_Avoid_: Project, Space, Account

**Folder**:
A named, nestable container for Documents and other Folders within a Workspace.
_Avoid_: Directory, Notebook, Category

**Document**:
An editable text note with a title and body, belonging to exactly one Workspace and at most one Folder.
_Avoid_: Note, File, Page, Content

**Archived Document**:
A Document marked as no longer active. It stays in its Folder and remains searchable.
_Avoid_: Deleted, Trashed

**Search Query**:
The text a person enters in the sidebar Search tab to find Documents in the current Workspace.
_Avoid_: Filter, Lookup

**Search Result**:
A Document that matches a Search Query, together with the Folder path it lives in and, when the body matched, a Snippet.
_Avoid_: Hit, Match

**Snippet**:
The short excerpt of a Document's body shown inside a Search Result around the matched text.
_Avoid_: Preview, Summary
