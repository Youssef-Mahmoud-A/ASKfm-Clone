import { NotFoundException } from "../../common/exceptions/index.js";
import { createOne, deleteOne, findById, findOne, paginate } from "../../common/repository/index.js";
import { MessageModel, UserModel } from "../../DB/Model/index.js";

export const createMessage = async ({ content, receiverId } = {}, files = [], user = undefined) => {
    const checkReceiverExist = await findById({
        model: UserModel,
        id: receiverId
    })
    if (!checkReceiverExist) {
        throw NotFoundException("Invalid receiver ID")
    }
    const message = await createOne({
        model: MessageModel,
        data: {
            receiverId,
            content,
            attachments: files.map(ele => ele.path),
            ...(user ? { senderId: user._id } : {})
        }
    })
    return message;
}

export const getAllMessages = async ({ type, page, limit } = {}, user) => {

    let filter = {};

    if (type == "0") {
        filter = { receiverId: user._id }
    } else if (type == "1") {
        filter = { senderId: user._id }
    } else {
        filter = {
            $or: [
                { senderId: user._id },
                { receiverId: user._id }
            ],
        }
    }

    const data = await paginate({
        model: MessageModel,
        page,
        limit,
        filter,
        options: {
            sort: { createdAt: -1 }
        }
    })
    // const skip = (page - 1) * limit
    // const count = await countDocument({ filter, model: MessageModel })
    // const pages = Math.ceil(count / limit)

    // const messages = await find({
    //     model: MessageModel,
    //     filter: {
    //         ...filter
    //     },
    //     options: {
    //         skip,
    //         limit,
    //         sort: { createdAt: -1 }
    //     }
    // })

    // return { currentPage: page, count, limit, pages, messages };

    return data;
}

export const deleteMessage = async ({ messageId }, user) => {
    const data = await deleteOne({
        model: MessageModel,
        filter: { receiverId: user._id, _id: messageId }
    })
    if (!data.deletedCount) {
        throw NotFoundException("Invalid message ID to be deleted!!!")
    }
    return data;
}

export const getMessage = async ({ messageId }, user) => {
    const data = await findOne({
        model: MessageModel,
        filter: { receiverId: user._id, _id: messageId }
    })
    if (!data) {
        throw NotFoundException("Invalid message with this ID!!!")
    }
    return data;
}
