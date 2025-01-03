const mongoose = require("mongoose")

const GroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupDescription: {
        type: String,
        required: true
    },
    groupProfilePicture: {
        type: String,
        default: "https://q596ewgrcavwwqaq.public.blob.vercel-storage.com/1732243931610-defaultgroup.png-5L3BQnWmfnTB8Gp9VrY2vbeuBmRsl5.png"
    },
    groupCategory: {
        type: String,
        required: true
    },
    groupType: {
      type: String,
      required: true
    },
    groupAccess: {
        type: String,
        required: true
    },
    participants: [{
        participant_id: mongoose.SchemaTypes.ObjectId,
        participant_name: {
            type: String,
            required: true
        },
        participant_profilePic: {
            type: String,
            default: "https://q596ewgrcavwwqaq.public.blob.vercel-storage.com/1732243758227-defaultpic-xSo3tO0fcbretv54zGHgMpuo7xz2Av.png"
        }
    }],
    memberCount: {
        type: Number,
        default: 100
    },
    groupAdmins: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        admin_name: {
            type: String,
        },
        admin_profilePic: {
            type: String,
            default: "https://q596ewgrcavwwqaq.public.blob.vercel-storage.com/1732243758227-defaultpic-xSo3tO0fcbretv54zGHgMpuo7xz2Av.png"
        }
    }],
    groupModerators: [{
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'User',
        moderator_name: {
            type: String,
            required: true
        },
        moderator_profilePic: {
            type: String,
            default: "https://q596ewgrcavwwqaq.public.blob.vercel-storage.com/1732243758227-defaultpic-xSo3tO0fcbretv54zGHgMpuo7xz2Av.png"
        }
    }],
    owner: {
        id: mongoose.SchemaTypes.ObjectId,
        owner_name: {
            type: String
        },
    },
    requested_participants: [{
        participant_id: mongoose.SchemaTypes.ObjectId,
        participant_name: {
            type: String,
        },
        participant_profilePic: {
            type: String,
            default: "https://q596ewgrcavwwqaq.public.blob.vercel-storage.com/1732243931610-defaultgroup.png-5L3BQnWmfnTB8Gp9VrY2vbeuBmRsl5.png"
        }
    }],
    posts: [
        {
          postContent: {
            type: String,
          },
          postImg: {
            type: String,
          },
          createdAt: {
            type: String,
            default: function () {
              const date = new Date();
              return date.getHours() + " " + date.getFullYear();
            },
          },
          likes: [
            {
              likerId: {
                type: mongoose.SchemaTypes.ObjectId,
              },
              likerUsername: {
                type: String,
              },
            },
          ],
          comments: [
            {
              commenterId: {
                type: mongoose.SchemaTypes.ObjectId,
              },
              commenterUsername: {
                type: String,
              },
              comment: {
                type: String,
              },
            },
          ],
          tags: [
            {
              taggedId: {
                type: mongoose.SchemaTypes.ObjectId,
              },
              taggedusername: {
                type: String,
              },
            },
          ],
        },
      ],
      letters: [
        {
          letterContent: {
            type: String,
          },
          letterHead: {
            type: String,
          },
          createdAt: {
            type: String,
            default: function () {
              const date = new Date();
              return date.getHours() + " " + date.getFullYear();
            },
          },
          likes: [
            {
              likerId: {
                type: mongoose.SchemaTypes.ObjectId,
              },
              likerUsername: {
                type: String,
              },
            },
          ],
          comments: [
            {
              commenterId: {
                type: mongoose.SchemaTypes.ObjectId,
              },
              commenterUsername: {
                type: String,
              },
              comment: {
                type: String,
              },
            },
          ],
          tags: [
            {
              taggedId: {
                type: mongoose.SchemaTypes.ObjectId,
              },
              taggedusername: {
                type: String,
              },
            },
          ],
        },
      ],
      conversations: [
        {
          id: {
            type: mongoose.SchemaTypes.ObjectId,
          },
          participantName: [String]
        },
      ],
    createdAt: {
        type: Date,
        immutable: true,
        default: function () {
        return new Date(); // Return a new Date object
        }, 
    }
})

const Group = mongoose.model("Group", GroupSchema)

module.exports = Group