import { Migration } from '@mikro-orm/migrations';

export class Migration20210404234218 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "user" add column "forgot_password_token" text null;');
  }

}
