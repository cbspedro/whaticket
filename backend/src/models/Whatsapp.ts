import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  DataType,
  PrimaryKey,
  AutoIncrement,
  Default,
  AllowNull,
  HasMany,
  Unique,
  BelongsToMany,
  ForeignKey,
  BelongsTo,
  HasOne
} from "sequelize-typescript";
import Queue from "./Queue";
import Ticket from "./Ticket";
import WhatsappQueue from "./WhatsappQueue";
import Company from "./Company";
@Table
class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;
  @AllowNull
  @Unique
  @Column(DataType.TEXT)
  name: string;
  @Column(DataType.TEXT)
  session: string;
  @Column(DataType.TEXT)
  qrcode: string;
  @Column
  status: string;
  @Column
  battery: string;
  @Column
  plugged: boolean;
  @Column
  retries: number;
  @Column
  number: string;
  @Default("")
  @Column(DataType.TEXT)
  greetingMessage: string;
  @Column
  greetingMediaAttachment: string;
  @Default("")
  @Column(DataType.TEXT)
  farewellMessage: string;
  @Default("")
  @Column(DataType.TEXT)
  complationMessage: string;
  @Default("")
  @Column(DataType.TEXT)
  outOfHoursMessage: string;
  @Default("")
  @Column(DataType.TEXT)
  ratingMessage: string;
  @Column({ defaultValue: "stable" })
  provider: string;
  @Default(false)
  @AllowNull
  @Column
  isDefault: boolean;
  @Default(false)
  @Column
  chatGPTEnabled: boolean;
  @CreatedAt
  createdAt: Date;
  @UpdatedAt
  updatedAt: Date;
  @HasMany(() => Ticket)
  tickets: Ticket[];
  @BelongsToMany(() => Queue, () => WhatsappQueue)
  queues: Array<Queue & { WhatsappQueue: WhatsappQueue }>;
  @HasMany(() => WhatsappQueue)
  whatsappQueues: WhatsappQueue[];
  @ForeignKey(() => Company)
  @Column
  companyId: number;
  @BelongsTo(() => Company)
  company: Company;
  @Column
  token: string;
  @Column(DataType.TEXT)
  facebookUserId: string;
  @Column(DataType.TEXT)
  facebookUserToken: string;
  @Column(DataType.TEXT)
  facebookPageUserId: string;
  @Column(DataType.TEXT)
  tokenMeta: string;
  @Column(DataType.TEXT)
  channel: string;
  @Default(3)
  @Column
  maxUseBotQueues: number;

  @ForeignKey(() => Queue)
  @Column
  maxUseBotQueueId: number;

  @BelongsTo(() => Queue)
  maxUseBotQueue: Queue;

  @AllowNull(true)
  @Default(0)
  @Column
  expiresTicket: number;
}
export default Whatsapp;