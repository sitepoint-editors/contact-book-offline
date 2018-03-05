
const CONTACT_ID_ATTR_NAME = 'data-contractid';
const CONTACT_REMOVE_CONFIRM = 'Are you sure?';
const NO_CONTACTS_TEXT = 'No contacts';

class ContactBook {

    constructor(storeClass, remote) {
        this.store = new storeClass('contacts', remote, () => {
            this.refresh();
        });

        this.init();
        this.refresh();
        this.toggleContactFormEditing(false);
    }

    init() {
        this.initElements();
        this.initItemTemplate();
        this.attachHandlers();
    }

    initElements() {
        this.contactList = document.getElementById('contactList');

        this.contactDetailsForm = document.getElementById('contactDetails');
        this.contactIdField = document.getElementById('contactid');
        this.firstNameField = document.getElementById('firstname');
        this.lastNameField = document.getElementById('lastname');
        this.phoneField = document.getElementById('phone');

        this.addContactButton = document.getElementById('addContact');
        this.editContactButton = document.getElementById('editContact');
        this.removeContactButton = document.getElementById('removeContact');
        this.saveContactButton = document.getElementById('saveContact');
        this.cancelEditButton = document.getElementById('cancelEdit');
    }

    initItemTemplate() {
        let contactListItem = this.contactList.querySelector('li');
        this.contactList.removeChild(contactListItem);
        this._contactTemplate = contactListItem;
    }

    attachHandlers() {
        this.contactDetailsForm.addEventListener('submit', event => {
            event.preventDefault();
        });

        this.addContactButton.addEventListener('click', () => { this.addContact() });
        this.editContactButton.addEventListener('click', () => { this.editContact() });
        this.removeContactButton.addEventListener('click', () => { this.removeContact() });
        this.saveContactButton.addEventListener('click', () => { this.saveContact() });
        this.cancelEditButton.addEventListener('click', () => { this.cancelEdit() });
    }

    refresh() {
        this.store.getAll().then(contacts => {
            this.sortContacts(contacts);
            this.renderContactList(contacts);
        });
    }

    static sortContacts(contacts) {
        contacts.sort((contact1, contact2) => {
            return (contact1.firstName + contact1.lastName).localeCompare(contact2.firstName + contact2.firstName);
        });
    }

    renderContactList(contacts) {
        this.contactList.innerHTML = '';
        this.contactList.appendChild(this.createContactList(contacts));
    }

    createContactList(contacts) {
        if(!contacts.length)
            return this.createNoDataItem();

        let result = document.createDocumentFragment();

        contacts.forEach(contact => {
            result.appendChild(this.createContact(contact))
        });

        return result;
    }

    static createNoDataItem() {
        let result = document.createElement('li');
        result.className = 'contact-list-empty';
        result.textContent = NO_CONTACTS_TEXT;
        return result;
    }

    createContact(contact) {
        let result = this._contactTemplate.cloneNode(true);
        result.setAttribute(CONTACT_ID_ATTR_NAME, contact._id);
        result.querySelector('.contact-name').innerText = contact.firstName + ' ' + contact.lastName;
        result.querySelector('.contact-phone').innerText = contact.phone;
        result.addEventListener('click', event => { this.showContact(event) });
        return result;
    }

    showContact(event) {
        let contactId = event.currentTarget.getAttribute(CONTACT_ID_ATTR_NAME);

        this.store.get(contactId).then(contact => {
            this.setContactDetails(contact);
            this.toggleContactFormEditing(false);
        })
    }

    addContact() {
        this.setContactDetails({ firstName: 'Name' });
        this.toggleContactFormEditing(true);
    }

    editContact() {
        let contactId = this.getContactId();

        this.store.get(contactId).then(contact => {
            this.setContactDetails(contact);
            this.toggleContactFormEditing(true);
        });
    }

    saveContact() {
        let contact = this.getContactDetails();

        this.store.save(contact).then(() => {
            this.setContactDetails({});
            this.toggleContactFormEditing(false);
            this.refresh();
        });
    }

    removeContact() {
        if(!window.confirm(CONTACT_REMOVE_CONFIRM))
            return;

        let contactId = this.getContactId();

        this.store.remove(contactId).then(() => {
            this.setContactDetails({});
            this.toggleContactFormEditing(false);
            this.refresh();
        });
    }

    cancelEdit() {
        this.setContactDetails({});
        this.toggleContactFormEditing(false);
    }

    getContactDetails() {
        return {
            _id: this.getContactId(),
            firstName: this.firstNameField.value,
            lastName: this.lastNameField.value,
            phone: this.phoneField.value
        };
    }

    getContactId() {
        return this.contactIdField.value;
    }

    setContactDetails(contactDetails) {
        this.contactIdField.value = contactDetails._id || '';
        this.firstNameField.value = contactDetails.firstName || '';
        this.lastNameField.value = contactDetails.lastName || '';
        this.phoneField.value = contactDetails.phone || '';
    }

    toggleContactFormEditing(isEditing) {
        let isContactSelected = !this.getContactId();

        this.toggleFade(this.contactDetailsForm, !isEditing && isContactSelected);

        this.toggleElement(this.editContactButton, !isEditing && !isContactSelected);
        this.toggleElement(this.removeContactButton, !isEditing && !isContactSelected);

        this.toggleElement(this.addContactButton, !isEditing);
        this.toggleElement(this.saveContactButton, isEditing);
        this.toggleElement(this.cancelEditButton, isEditing);

        this.toggleDisabled(this.firstNameField, !isEditing);
        this.toggleDisabled(this.lastNameField, !isEditing);
        this.toggleDisabled(this.phoneField, !isEditing);

        this.firstNameField.focus();
        this.firstNameField.setSelectionRange(0, this.firstNameField.value.length);
    }

    static toggleElement(element, isShown) {
        element.style.display = isShown ? 'block' : 'none';
    }

    static toggleFade(element, isFade) {
        element.style.opacity = isFade ? .5 : 1;
    }

    static toggleDisabled(element, isDisabled) {
        if(isDisabled) {
            element.setAttribute('disabled', '');
        } else {
            element.removeAttribute('disabled');
        }
    }
}

window.ContactBook = ContactBook;
