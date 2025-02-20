import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateNotificationTypeEnum1678921234567
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TYPE notifications_type_enum
            ADD VALUE 'connection_invitation' IF NOT EXISTS,
            ADD VALUE 'send_gift' IF NOT EXISTS,
            ADD VALUE 'send_motivation' IF NOT EXISTS,
            ADD VALUE 'send_applaud' IF NOT EXISTS,
            ADD VALUE 'no_scheduled_friends' IF NOT EXISTS,
            ADD VALUE 'friends_in_danger_zone' IF NOT EXISTS,
            ADD VALUE 'friends_in_applaud_zone' IF NOT EXISTS
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add rollback logic if necessary
  }
}
