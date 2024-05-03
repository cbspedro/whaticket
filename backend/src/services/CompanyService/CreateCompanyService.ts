import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Setting from "../../models/Setting";
import sequelize from "../../database";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  dueDate?: string;
  recurrence?: string;
  document?: string;
  paymentMethod?: string;
  password?: string;
  companyUserName?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    password,
    email,
    status,
    planId,
    dueDate,
    recurrence,
    document,
    paymentMethod,
    companyUserName
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME")
  });

  try {
    await companySchema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const t = await sequelize.transaction();

  try {
    const company = await Company.create(
      {
        name,
        phone,
        email,
        status,
        planId,
        dueDate,
        recurrence,
        document,
        paymentMethod
      },
      { transaction: t }
    );

    await User.create(
      {
        name: companyUserName ? companyUserName : name,
        email: company.email,
        password: password ? password : "mudar123",
        profile: "admin",
        companyId: company.id
      },
      { transaction: t }
    );

    const defaultSettings = [
      { key: "hoursCloseTicketsAuto", value: "9999999999" },
      { key: "CheckMsgIsGroup", value: "enabled" },
      { key: "acceptCallWhatsapp", value: "disabled" },
      { key: "scheduleType", value: "disabled" },
      { key: "userRating", value: "disabled" },
      { key: "chatBotType", value: "text" },
      { key: "userRandom", value: "disabled" },
      { key: "sendMsgTransfTicket", value: "disabled" },
      { key: "sendGreetingAccepted", value: "disabled" },
      { key: "sendSignMessage", value: "enabled" },
      { key: "urlTypeBot", value: "" },
      { key: "viewerTypeBot", value: "" },
      { key: "apiKeyTypeBot", value: "" },
      { key: "typeTimer", value: "" }, // Adicionando typeTimer
      { key: "recordTimer", value: "" } // Adicionando recordTimer
    ];

    await Promise.all(
      defaultSettings.map(async (setting) => {
        await Setting.create(
          { companyId: company.id, ...setting },
          { transaction: t }
        );
      })
    );

    await t.commit();
    return company;
  } catch (error) {
    await t.rollback();
    throw new AppError("Não foi possível criar a empresa!");
  }
};

export default CreateCompanyService;
