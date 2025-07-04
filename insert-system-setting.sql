INSERT INTO system_setting (name, data)
VALUES
('allowed file extensions', '{"data":{"doc":{"mime":"application/msword","allowed":true,"maxSizeMb":40},"pdf":{"mime":"application/pdf","allowed":true,"maxSizeMb":50},"ppt":{"mime":"application/vnd.ms-powerpoint","allowed":true,"maxSizeMb":40},"xls":{"mime":"application/vnd.ms-excel","allowed":true,"maxSizeMb":5},"docx":{"mime":"application/vnd.openxmlformats-officedocument.wordprocessingml.document","allowed":true,"maxSizeMb":3},"pptx":{"mime":"application/vnd.openxmlformats-officedocument.presentationml.presentation","allowed":true,"maxSizeMb":40},"xlsx":{"mime":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","allowed":true,"maxSizeMb":5}},"name":"allowed file extensions"}'),
('daily limit uploads', '{"data":{"limit":8,"active":true},"name":"daily limit uploads"}'),
('reveal settings', '{"data":{"course":{"delay":11.5,"active":true},"university":{"delay":11.5,"active":true},"defaultDelay":24},"name":"reveal settings"}'),
('feature toggles', '{"data":{"votingSystem":true,"contentReporting":true,"documentRevealing":true,"documentUploading":true},"name":"feature toggles"}'),
('moderation', '{"data":{"rejectedThreshold":5,"flaggedThreshold":3,"requaireModeratorApproval":true},"name":"moderation"}'),
('notification', '{"data":{"adminAlertInterval":5,"adminAlertThreshold":10,"adminNotificationRecipients":[""]},"name":"notification"}');
