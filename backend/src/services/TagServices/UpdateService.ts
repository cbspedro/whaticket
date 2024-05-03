import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Tag from "../../models/Tag";
import ShowService from "./ShowService";
interface TagData {
  id?: number;
  name?: string;
  color?: string;
  kanban?: number;
  msgR?: string;
  rptDays?: number;
  actCamp?: number;
}
interface Request {
  tagData: TagData;
  id: string | number;
}
const UpdateUserService = async ({
  tagData,
  id
}: Request): Promise<Tag | undefined> => {
  const tag = await ShowService(id);
  const schema = Yup.object().shape({ name: Yup.string().min(3) });
  const { name, color, kanban, msgR, rptDays, actCamp } = tagData;
  try {
    await schema.validate({ name });
  } catch (err: any) {
    throw new AppError(err.message);
  }
  await tag.update({ name, color, kanban, msgR, rptDays: rptDays || 0, actCamp: actCamp || 0, });
  await tag.reload();
  return tag;
};
export default UpdateUserService;
