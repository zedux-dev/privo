-- get all chats where a user is
SELECT DISTINCT members.name, members.surname, members.profile_pic_url, partecipants.id_chat, chats.E2EE_hashed_key FROM chats, partecipants, members WHERE members.uid_members <> 'uid' AND members.uid_members = partecipants.id_members AND partecipants.id_chat IN (SELECT DISTINCT chats.id_chat FROM chats, members, partecipants WHERE chats.id_chat = partecipants.id_chat AND partecipants.id_members = 'uid') AND partecipants.id_chat = chats.id_chat;

-- get last message from chat
SELECT * FROM messages WHERE messages.id_message = (SELECT MAX(messages.id_message) FROM messages WHERE messages.id_chat = 1)

-- set all messages of a chat to status 2 (read)
UPDATE messages SET messages.status = 2 WHERE messages.id_chat = " + chat_id + " AND messages.id_member = (SELECT DISTINCT members.uid_members FROM members, partecipants, chats WHERE partecipants.id_chat = " + chat_id + " AND partecipants.id_members = members.uid_members AND partecipants.id_members <> '" + uid + "');

-- get all messages from a chat
SELECT DISTINCT * FROM messages WHERE messages.id_chat = 1;

-- send a new message
INSERT INTO messages (messages.id_member, messages.id_chat, messages.status, messages.body, messages.time) VALUES ('', 1, 1, '', (SELECT NOW()));