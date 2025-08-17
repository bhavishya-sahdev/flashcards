import * as posts from "./posts";
import * as flashcards from "./flashcards";
import * as users from "./user";
import * as roadmaps from "./roadmaps";
import * as notifications from "./notifications";

export default { ...posts, ...flashcards, ...users, ...roadmaps, ...notifications };
