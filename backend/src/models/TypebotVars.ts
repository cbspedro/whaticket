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
class TypeBotVars extends Model<TypeBotVars> {
  @Column
  urlTypeBot: string;
  @Column
  viewerTypeBot: string;
  @Column
  apiKeyTypeBot: string;
  @Column
  typeTimer: string;
  @Column
  recordTimer: string;
  @ForeignKey(() => Company)
  @Column
  companyId: number;
  @BelongsTo(() => Company)
  company: Company;
}
export default TypeBotVars;
