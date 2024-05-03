import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo
} from "sequelize-typescript";
import Company from "./Company";
@Table
class Evento extends Model<Evento> {
  @Column({ type: DataType.STRING, allowNull: false })
  title: string;
  @Column(DataType.TEXT)
  description: string;
  @Column({ type: DataType.DATE, allowNull: false })
  start: Date;
  @Column({ type: DataType.DATE, allowNull: false })
  end: Date;
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  concluido: boolean;
  @ForeignKey(() => Company)
  @Column
  companyId: number;
  @BelongsTo(() => Company)
  company: Company;
}
export default Evento;
