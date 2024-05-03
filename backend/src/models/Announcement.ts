import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  DataType,
  BelongsTo,
  ForeignKey
} from "sequelize-typescript";
import Company from "./Company";
@Table
class Announcement extends Model<Announcement> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;
  @Column
  priority: number;
  @Column
  title: string;
  @Column(DataType.TEXT)
  text: string;
  @Column
  mediaPath: string;
  @Column
  mediaName: string;
  @ForeignKey(() => Company)
  @Column
  companyId: number;
  @Column
  status: boolean;
  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @BelongsTo(() => Company)
  company: Company;
}
export default Announcement;
