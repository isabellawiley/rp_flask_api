import { sendForm } from "./request.js";

export class Notes {
  constructor() {
    this.allNoteLists = document.querySelectorAll(".note-list");
    this.allNotes = document.querySelectorAll(".note-card");
    this.allNotesContainers = document.querySelectorAll(".notes-container");
    this.activateAllCreateForms();
    this.activateAllControls();
    this.activateAllDropdowns();
  }

  activateAllCreateForms() {
    this.allNoteLists.forEach((noteList) => {
      const personCard = noteList.closest(".person-card");
      const personID = personCard.getAttribute("data-person-id");
      new NoteCreateForm(noteList, personID);
    });
  }

  activateAllControls() {
    this.allNotes.forEach((noteCard) => {
      new NoteControl(noteCard);
    });
  }

  activateAllDropdowns() {
    this.allNotesContainers.forEach((noteContainer) => {
      new NoteDropdown(noteContainer);
    })
  }
}

export class NoteCreateForm {
  constructor(noteList, personID) {
    this.noteList = noteList;
    this.personID = personID;
    this.form = this.noteList.querySelector(".note-create-card form");
    this.createButton = this.form.querySelector(
      "button[data-action='create']"
    );
    this.createButton.addEventListener(
      "click",
      this.handleCreateClick.bind(this)
    );
    this.connectPerson();
  }

  connectPerson() {
    let fieldPersonID = this.form.querySelector("input[name='person_id']");
    fieldPersonID.setAttribute("value", this.personID);
  }

  handleCreateClick(event) {
    event.preventDefault();
    sendForm(this.form, "POST", "/api/notes", this.addNoteToList);
    this.form.reset();
  }

  addNoteToList(rawData) {
    const data = JSON.parse(rawData);
    const noteList = document
      .querySelector("[data-person-id= '" + data.person_id + "']")
      .querySelector(".note-list");
    const newNoteCard = document.querySelector(".note-card").cloneNode(true);
    newNoteCard.querySelector(".note-content").textContent = data.content;
    newNoteCard.setAttribute("data-note-id", data.id);
    noteList.insertBefore(newNoteCard, noteList.children[1]);
    new NoteControl(newNoteCard);
  }
}

class NoteControl {
  constructor(noteCard) {
    this.noteCard = noteCard;
    this.noteElement = this.noteCard.querySelector(".note-content");
    this.noteControl = this.noteCard.querySelector(".note-control");
    this.noteID = this.noteCard.getAttribute("data-note-id");
    this.form = this.noteCard.querySelector("form");

    this.editBtn = this.noteCard.querySelector(".toggle-control");
    this.editBtn.addEventListener("click", this.handleEditClick.bind(this));
    this.cancelBtn = this.noteCard.querySelector("[data-action='cancel']");
    this.cancelBtn.addEventListener('click', this.handleCancelClick.bind(this));
    this.deleteBtn = this.noteCard.querySelector("[data-action='delete']");
    this.deleteBtn.addEventListener('click', this.handleDeleteClick.bind(this));
    this.updateBtn = this.noteCard.querySelector("[data-action='update']");
    this.updateBtn.addEventListener("click", this.handleUpdateClick.bind(this));

    this.fillControlForm();
  }

  handleEditClick(event) {
    event.preventDefault();
    this.noteCard.querySelector(".note-control-card").classList.add("editing");
    this.noteElement.classList.add("hidden");
    this.editBtn.classList.add("hidden");
    this.noteControl.classList.remove("hidden");
  }

  handleCancelClick(event) {
    event.preventDefault();
    this.noteCard.querySelector(".note-control-card").classList.remove("editing");
    this.noteElement.classList.remove("hidden");
    this.editBtn.classList.remove("hidden");
    this.noteControl.classList.add("hidden");
  }

  handleDeleteClick(event) {
    event.preventDefault();
    const endpoint = "/api/notes/" + this.noteID;
    sendForm(this.form, "DELETE", endpoint, (data, inputForm) => {
      let noteCard = inputForm.closest(".note-card");
      if(window.confirm("Do you really want to delete this note?")){
        noteCard.remove();
      }
    });
  }

  handleUpdateClick(event) {
    event.preventDefault();
    const endpoint = "/api/notes/" + this.noteID;
    sendForm(this.form, "PUT", endpoint, this.updateNoteInList);
    this.cancelBtn.click();
  }

  updateNoteInList(rawData, inputForm) {
    const data = JSON.parse(rawData);
    const noteCard = inputForm.closest(".note-card");

    const noteContent = noteCard.querySelector(".note-content");
    noteContent.textContent = data.content;
  }

  fillControlForm() {
    const noteContent = this.noteElement.textContent;
    this.form.querySelector("[name='id']").setAttribute("value", this.noteID);
    this.form.querySelector("[name='content']").setAttribute("value", noteContent)
  }
}

class NoteDropdown {
  constructor(noteContainer) {
    this.noteContainer = noteContainer;
    this.noteList = this.noteContainer.querySelector(".note-list");

    this.arrow = this.noteContainer.querySelector(".arrow");
    this.arrow.addEventListener("click", this.handleDropdownClick.bind(this));
  }

  handleDropdownClick(event) {
    event.preventDefault();
    let arrowDown = this.arrow.classList.contains("down");

    if(arrowDown) {
      this.arrow.classList.remove("down");
      this.arrow.classList.add("up");
      this.noteList.classList.remove('hidden');
    }
    else {
      this.arrow.classList.remove("up");
      this.arrow.classList.add("down");
      this.noteList.classList.add("hidden");
    }
  }
}