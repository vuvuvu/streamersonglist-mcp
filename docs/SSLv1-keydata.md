StreamerSonglist v1 API – Key Data Models

This document summarizes the most important data structures (schemas) defined in the v1 StreamerSonglist API. Understanding these models will help you design MCP endpoints, integrate new features, and ensure your bot’s responses reflect the API’s structure. Only the fields that are likely to be useful for a Twitch bot are included here; for the complete definitions see the API’s OpenAPI specification.

SongEntity

Represents a single song in a streamer’s catalogue. Each song can appear in live queues, saved queues and play histories and can be tagged with attributes. Only a few properties are writable; most are read‑only or managed by the server. The streamerId field ties each song to its owner.

Property	Type	Notes
id	number	Unique identifier (read‑only)
title	string	Song title
artist	string	Song artist
createdAt	string (date‑time)	When the song was added
active	boolean	If the song is currently active
lastActivation	string (date‑time)	Last time the song was activated
comment	string	Free‑form notes
tabs/lyrics/chords/capo	string	Optional guitar tabs, lyrics, chords and capo information
learned	boolean	Whether the streamer has learned the song
requestedBy	string	Optional user who requested the song
bypassRequestLimits	boolean	Whether the song ignores request‑limit rules
minAmount	number	Minimum donation amount required
queues / offlineQueues / playHistories	array	Relationships to queue, saved queue and play history items
streamerId	number	Owning streamer ID
attributes	array	Tags (see AttributeEntity)
pollSongs	array	Poll entries linking this song (see PollSongEntity)

Citation: These properties are defined in the OpenAPI spec for SongEntity
api.streamersonglist.com
.

QueueForListDef (Queue Item)

Represents a single item in a streamer’s live queue. When someone requests a song, the server creates a queue entry with references back to the song. The MCP server uses this schema when listing or managing queue items.

Property	Type	Notes
id	number	Queue item ID (read‑only)
note	string	Viewer’s note or dedication
botRequestedBy	string	Bot or user who placed the request
nonlistSong	string	Non‑catalogue title if the song isn’t on the list
donationAmount	number	Donation amount attached to the request
createdAt	string	When the request was made (read‑only)
song	SongEntity	The full song details (read‑only)
songId	number	ID of the requested song
streamerId	number	Owning streamer ID
position	number	Position in the queue

Citation: This structure is defined in the QueueForListDef schema
api.streamersonglist.com
.

SavedQueueEntity

Represents a saved (offline) queue entry. These objects mirror queue items but omit the position field because offline queues aren’t ordered until they’re reloaded.

Property	Type	Notes
id	number	Offline queue item ID (read‑only)
note	string	Viewer’s note
botRequestedBy	string	Bot or user who placed the request
nonlistSong	string	Non‑catalogue title
donationAmount	number	Donation attached to the request
createdAt	string	When the item was created (read‑only)
song	SongEntity	Song details (read‑only)
songId	number	ID of the requested song
streamerId	number	Owning streamer ID
PlayHistoryEntity

Represents a record of a song that has been played on stream. You can query play history to avoid repeating songs too often or to display recently played tracks.

Property	Type	Notes
id	number	Unique history entry ID (read‑only)
createdAt	string	When the history entry was created
playedAt	string	When the song was actually played
donationAmount	number	Amount donated for this play
nonlistSong	string	Non‑catalogue title
note	string	Viewer’s note
song	SongEntity	Song details
streamer	StreamerEntity	Streamer details (see below)
streamerId	number	Owning streamer ID

Citation: These fields are defined in the PlayHistoryEntity schema
api.streamersonglist.com
.

AttributeEntity (Song Tag)

Attributes are tags that categorize songs (for example, ballad, hype, instrumental). The API uses attributes to filter and prioritize songs. Each attribute can be active/inactive, follower‑only, subscriber‑only, etc. Activating or deactivating songs for an attribute updates the song’s presence in the filtered list.

Property	Type	Notes
id	number	Attribute ID (read‑only)
name	string	Tag name
image	string	URL or path to an icon
priority	number	Display priority (lower means higher priority)
songOrdering	number	Order songs within this attribute
minAmount	number	Minimum donation to request songs in this attribute
show / showSelector	boolean	Whether to display the attribute and its selector
overrideNew	boolean	If true, songs tagged with this attribute ignore the “new” filter
active	boolean	Whether the tag is active
followerOnly	boolean	Restrict usage to followers
subscriberOnly	boolean	Restrict usage to subscribers
bypassRequestLimits	boolean	Override request limits
subTier	object	Optional subscriber tier restrictions
songs	array	Songs tagged with this attribute (read‑only)
streamerId	number	Owning streamer ID (read‑only)

Citation: The AttributeEntity schema defines these fields
api.streamersonglist.com
.

PollEntity & PollSongEntity

StreamerSonglist includes a poll system for viewers to vote on songs. A poll contains multiple PollSongEntity objects linking to songs.

PollEntity
Property	Type	Notes
id	number	Poll ID (read‑only)
title	string	Poll title
createdAt	string	When the poll was created
createdBy	string	Creator’s user name
endAt / endedAt	string	Scheduled end time and actual end time
streamerId	number	Owning streamer ID
pollSongs	array	Array of PollSongEntity objects
PollSongEntity
Property	Type	Notes
pollId	number	Parent poll ID (read‑only)
songId	number	ID of the song in the poll (read‑only)
customTitle	string	Alternate title displayed in the poll
song	SongEntity	Full song details (read‑only)

Citation: The PollEntity and PollSongEntity definitions appear in the API specification
api.streamersonglist.com
.

Other Entities

Additional models exist in the API but are less relevant for queue management and song search. These include:

OverlayEntity – describes overlay templates and settings for streaming software
api.streamersonglist.com
.

GlobalCommandEntity – defines built‑in chat commands and their properties
api.streamersonglist.com
.

GlobalCommandPreferenceEntity – per‑streamer overrides for global commands
api.streamersonglist.com
.

BotChatMessageEntity – logs of bot chat messages and responses
api.streamersonglist.com
.

PlayHistoryResponseDef / QueueStatusDef – wrapper objects used in list responses and queue status calls
api.streamersonglist.com
.

These schemas provide structure for features like overlay management, chat command customization and status reporting. When extending the MCP server to use these features, refer back to the OpenAPI specification for their complete definitions.