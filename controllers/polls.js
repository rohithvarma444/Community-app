import prisma from "../db/prisma/db.js";

export const createPoll = async (req, res) => {
    const { question, options } = req.body;
    const userId = req.user.id;

    try {
        if (options.some(option => option.text.trim() === "")) {
            return res.status(400).json({
                success: false,
                message: "Option text cannot be empty",
            });
        }

        const newPoll = await prisma.poll.create({
            data: {
                user_id: userId,
                poll_title: question,
            },
        });

        const pollOptions = options.map(option => ({
            poll_id: newPoll.poll_id,
            option_text: option.text,
        }));
        await prisma.pollOption.createMany({ data: pollOptions });

        return res.status(201).json({
            success: true,
            message: "Poll created successfully",
            poll: newPoll,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const voteOnPoll = async (req, res) => {
    const { pollId, optionId } = req.body;
    const userId = req.user.id;

    try {
        const poll = await prisma.poll.findUnique({
            where: { poll_id: parseInt(pollId) },
        });
        
        if (!poll) {
            return res.status(404).json({
                success: false,
                message: "Poll not found",
            });
        }
        
        const option = await prisma.pollOption.findUnique({
            where: { option_id: parseInt(optionId) },
        });
        
        if (!option) {
            return res.status(404).json({
                success: false,
                message: "Option not found",
            });
        }        
        const existingVote = await prisma.pollVote.findUnique({
            where: {
                user_id_poll_id_option_id: {
                    user_id: userId,
                    poll_id: parseInt(pollId),
                    option_id: parseInt(optionId),
                }
            },
        });

        if (existingVote) {
            return res.status(400).json({
                success: false,
                message: "You have already voted on this poll",
            });
        }
    
        await prisma.pollVote.create({
            data: {
                user_id: userId,
                poll_id: parseInt(pollId),
                option_id: parseInt(optionId),
            },
        });

        return res.status(201).json({
            success: true,
            message: "Vote cast successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const seeResults = async (req, res) => {
    const { pollId } = req.params;

    try {
        const poll = await prisma.poll.findUnique({
            where: { poll_id: parseInt(pollId) },
            select: {
                poll_title: true,
                options: {
                    select: {
                        option_id: true,
                        option_text: true,
                        _count: { select: { votes: true } },
                        votes: {
                            select: {
                                user: {
                                    select: {
                                        user_id: true,
                                        username: true,
                                        profilePic: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!poll) {
            return res.status(404).json({
                success: false,
                message: "Poll not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Poll results fetched successfully",
            poll,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


export const editPoll = async (req, res) => {
    const { question, options } = req.body;
    const pollId = req.params.pollId;
    const userId = req.user.id;


    try {
        const existingPoll = await prisma.poll.findUnique({ where: { poll_id: parseInt(pollId) } });

        if (!existingPoll) {
            return res.status(404).json({ success: false, message: "Poll not found" });
        }
        if (existingPoll.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await prisma.poll.update({
            where: { poll_id: parseInt(pollId) },
            data: { poll_title: question },
        });

        await prisma.pollOption.deleteMany({ where: { poll_id: parseInt(pollId) } });

        const newOptions = options.map(option => ({
            poll_id: parseInt(pollId),
            option_text: option.text,
        }));
        await prisma.pollOption.createMany({ data: newOptions });

        return res.status(200).json({
            success: true,
            message: "Poll updated successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const deletePoll = async (req, res) => {
    const { pollId } = req.params;
    const userId = req.user.id;

    try {
        const pollToDelete = await prisma.poll.findUnique({ where: { poll_id: parseInt(pollId) } });


        if (!pollToDelete) {
            return res.status(404).json({ success: false, message: "Poll not found" });
        }   

        if (pollToDelete.user_id !== userId) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        await prisma.pollOption.deleteMany({ where: { poll_id: parseInt(pollId) } });
        await prisma.poll.delete({ where: { poll_id: parseInt(pollId) } });

        return res.status(200).json({
            success: true,
            message: "Poll deleted successfully",
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const getUserPolls = async (req, res) => {
    try {
        const userId = req.user.id;

        const polls = await prisma.poll.findMany({
            where: { user_id: userId },
            select: {
                poll_id: true,
                poll_title: true,
                created_at: true,
                options: {
                    select: {
                        option_id: true,
                        option_text: true,
                        _count: { select: { votes: true } },
                    },
                },
            },
            orderBy: { created_at: "desc" },
        });
        

        if (polls.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
        success: true,
            message: "User's polls fetched successfully",
            polls,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const viewPoll = async (req, res) => {
    const { pollId } = req.params;

    try {
        const poll = await prisma.poll.findUnique({
            where: {
                poll_id: parseInt(pollId)
            },
            select: {
                poll_title: true,
                options: {
                    select: {
                        option_text: true,
                        option_id: true
                    }
                }
            }
        });

        if (!poll) {
            return res.status(404).json({
                success: false,
                message: "Poll not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Poll retrieved successfully",
            poll
        });
    } catch (error) {
        console.error("Error fetching poll: ", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
};
