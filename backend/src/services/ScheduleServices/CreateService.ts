import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Schedule from "../../models/Schedule";
interface Request {
  body: string;
  sendAt: string;
  contactId: number | string;
  companyId: number | string;
  userId?: number | string;
  daysR?: number;
  campId?: number;
  mediaPath?: string;
  mediaName?: string;
  
}
const CreateService = async ({
  body,
  sendAt,
  contactId,
  companyId,
  userId,
  daysR,
  campId,
  mediaPath,
  mediaName

}: Request): Promise<Schedule> => {
  const schema = Yup.object().shape({
    body: Yup.string().required().min(5),
    sendAt: Yup.string().required()
  });
  try {
    await schema.validate({ body, sendAt });
  } catch (err: any) {
    throw new AppError(err.message);
  }
  const schedule = await Schedule.create({
    body,
    sendAt,
    contactId,
    companyId,
    userId,
    status: "PENDENTE",
    daysR,
    campId,
    mediaPath,
    mediaName
   
  });
  await schedule.reload();
  return schedule;
};
export default CreateService;
