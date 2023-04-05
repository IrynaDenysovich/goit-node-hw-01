const fs = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const { Command } = require("commander");

const program = new Command();
program
  .option("-a, --action <type>", "choose action")
  .option("-i, --id <type>", "user id")
  .option("-n, --name <type>", "user name")
  .option("-e, --email <type>", "user email")
  .option("-p, --phone <type>", "user phone");

program.parse(process.argv);
const argv = program.opts();

const getConstactsPath = () => path.join(__dirname, "db", "/contacts.json");

const readContactArray = async () => {
  let result = [];
  try {
    const data = await fs.readFile(getConstactsPath(), { encoding: "utf8" });
    result = JSON.parse(data);
  } catch (error) {
    console.error(error);
  }
  return result;
};

const writeContactArray = async (contacts) => {
  let result = false;
  try {
    await fs.writeFile(getConstactsPath(), JSON.stringify(contacts, null, 4), {
      encoding: "utf8",
    });
    result = true;
  } catch (error) {
    console.error(error);
  }
  return result;
};

async function listContacts() {
  const contacts = await readContactArray();
  console.log(contacts);
}

async function getContactById(contactId) {
  const contacts = await readContactArray();
  let filteredConstacts = contacts.filter(
    (contact) => contact.id === contactId
  );

  console.log(filteredConstacts[0] ?? {});
}

async function removeContact(contactId) {
  let contacts = await readContactArray();
  let result = null;
  for (let i = 0; i < contacts.length; ++i) {
    const contact = contacts[i];
    if (contact.id === contactId) {
      result = contacts.splice(i, 1);
      break;
    }
  }

  if (result != null) {
    await writeContactArray(contacts);
  }

  console.log(result);
}

async function addContact(name, email, phone) {
  let contacts = await readContactArray();
  const contact = {
    id: uuidv4(),
    name: name,
    email: email,
    phone: phone,
  };
  contacts.push(contact);

  console.log(contact);

  await writeContactArray(contacts);
}

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case "list":
      listContacts();
      break;

    case "get":
      getContactById(id);
      break;

    case "add":
      addContact(name, email, phone);
      break;

    case "remove":
      removeContact(id);
      break;

    default:
      console.warn("\x1B[31m Unknown action type!");
  }
}

invokeAction(argv);

module.exports = { listContacts };
