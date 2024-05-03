import CheckSettings from "../../helpers/CheckSettings";
import { getIO } from "../../libs/socket";
import Contact from "../../models/Contact";
import ContactCustomField from "../../models/ContactCustomField";

interface ExtraInfo extends ContactCustomField {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup?: boolean; // Permitir isGroup ser opcional
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  channel?: string;
  extraInfo?: ExtraInfo[];
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup, // Remova a definição de isGroup daqui
  email = "",
  channel = "whatsapp",
  companyId,
  extraInfo = []
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
  const io = getIO();
  let contact: Contact | null;
  contact = await Contact.findOne({ where: { number, companyId } });

  // Verificar se o canal é Facebook ou Instagram
  const isGroupValue = channel === 'facebook' || channel === 'instagram' ? false : true;

  if (contact) {
    contact.update({ profilePicUrl });
    if (isGroup) {
      contact.update({ name });
    }
    io.emit(`company-${companyId}-contact`, { action: "update", contact });
  } else {
    const acceptAudioMessageContact = await CheckSettings(
      "acceptAudioMessageContact"
    );
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup: isGroupValue, // Usar isGroupValue aqui
      extraInfo,
      companyId,
      channel,
      acceptAudioMessage: acceptAudioMessageContact === "enabled" ? true : false
    });
    io.emit(`company-${companyId}-contact`, { action: "create", contact });
  }
  return contact;
};

export default CreateOrUpdateContactService;
