import { Migration } from '@mikro-orm/migrations';

export class Migration20210405023722 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" drop column "forgot_password_token";');
  }

}
