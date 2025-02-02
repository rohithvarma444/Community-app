import prisma from "../db/prisma/db.js";

export const createCategory = async (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({
            success: false,
            message: "Category name should not be empty"
        });
    }

    try {
        const existingCategory = await prisma.category.findUnique({
            where: {
                category_name: name
            }
        });

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category already exists"
            });
        }

        const category = await prisma.category.create({
            data: {
                category_name: name
            }
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to create category",
        });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            select: {
                category_name: true,
                category_id: true,
            }
        });

        res.status(200).json({
            success: true,
            message: "Categories fetched successfully",
            categories
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to get categories",
        });
    }
};
