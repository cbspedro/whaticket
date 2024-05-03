import {
  Table,
  Column,
  Model,
  ForeignKey,
  BelongsTo,
  DataType
} from "sequelize-typescript";
import Company from "./Company";
@Table
class Email extends Model<Email> {
  @Column
  sender: string;
  @Column
  subject: string;
  @Column(DataType.TEXT)
  message: string;
  @Column(DataType.BOOLEAN)
  scheduled: boolean;
  @Column(DataType.DATE)
  sendAt: Date;
  @ForeignKey(() => Company)
  @Column
  companyId: number;
  @BelongsTo(() => Company)
  company: Company;
}
export default Email;
