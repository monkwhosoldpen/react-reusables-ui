import { Model } from '@nozbe/watermelondb';
import type { SyncStatus, Associations } from '@nozbe/watermelondb/Model';

// Define the shape of the raw record
interface MessageRaw {
  id: string;
  _status: SyncStatus;
  _changed: string;
  _id: string;
  msg: string;
  rid: string;
  user_id: string;
  username: string;
  user_name: string;
  channel_id: string;
  created_at: number;
  updated_at: number;
}

export class Message extends Model {
  static table = 'messages';
  
  // Fix the associations type
  static associations: Associations = {
    channels: { type: 'belongs_to' as const, key: 'channel_id' }
  };

  // Define fields
  static fields = {
    _id: 'string',
    msg: 'string',
    rid: 'string',
    user_id: 'string',
    username: 'string',
    user_name: 'string',
    channel_id: 'string',
    created_at: 'number',
    updated_at: 'number'
  };

  // Declare _raw property with correct type
  declare _raw: {
    id: string;
    _status: SyncStatus;
    _changed: string;
    _id: string;
    msg: string;
    rid: string;
    user_id: string;
    username: string;
    user_name: string;
    channel_id: string;
    created_at: number;
    updated_at: number;
  }

  // Getters
  get _id() {
    return this._raw._id;
  }

  get msg() {
    return this._raw.msg;
  }

  get rid() {
    return this._raw.rid;
  }

  get userId() {
    return this._raw.user_id;
  }

  get username() {
    return this._raw.username;
  }

  get userName() {
    return this._raw.user_name;
  }

  get channelId() {
    return this._raw.channel_id;
  }

  get createdAt() {
    return this._raw.created_at;
  }

  get updatedAt() {
    return this._raw.updated_at;
  }

  // Update method
  async updateMessage(changes: {
    msg?: string;
    rid?: string;
    user_id?: string;
    username?: string;
    user_name?: string;
    channel_id?: string;
  }) {
    return this.update(record => {
      if (changes.msg) record._raw.msg = changes.msg;
      if (changes.rid) record._raw.rid = changes.rid;
      if (changes.user_id) record._raw.user_id = changes.user_id;
      if (changes.username) record._raw.username = changes.username;
      if (changes.user_name) record._raw.user_name = changes.user_name;
      if (changes.channel_id) record._raw.channel_id = changes.channel_id;
      record._raw.updated_at = Date.now();
    });
  }

  // Prepare create method
  static prepareCreate(record: Partial<Omit<MessageRaw, 'id' | '_status' | '_changed'>>) {
    return {
      _id: record._id || crypto.randomUUID(),
      msg: record.msg || '',
      rid: record.rid || '',
      user_id: record.user_id || '',
      username: record.username || '',
      user_name: record.user_name || '',
      channel_id: record.channel_id || '',
      created_at: Date.now(),
      updated_at: Date.now()
    };
  }
} 