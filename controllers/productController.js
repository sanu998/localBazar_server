import { Product } from "../models/productsModel.js";
import { Shop } from "../models/shopModel.js";
import { User } from "../models/userModel.js"
import { imageDestroy } from "../utils/imageDestroy.js";
import { imageUploader } from "../utils/imageUploder.js";

export const createProduct = async (req, res) => {
    try {
        // {
        //     "productName": "Sample Product",
        //     "price": 19.99,
        //     "stock": 100,
        //     "discount": 5,
        //     "totalPrice": 18.99,
        //     "description": "This is a sample product description.",
        //     "productImage": {
        //         "url": "https://example.com/sample-product.jpg",
        //         "public_id": "sample-product-image-123456"
        //     },
        //     "shopRef": "663a12fe66130513e5377eb3"
        // }

        // Create the product
        console.log("body", req.body);
        // *****************TODO**** image upload Handle*********************


        const {
            productName,
            price,
            stock,
            discount,
            totalPrice,
            description,
            productImage,
            shopRef
        } = req.body;

        const data = await imageUploader(productImage)
        console.log("image is",data);
        const shop = await Shop.findById(shopRef);
        console.log("shop", shop);
        if (!shop) {
            console.log("shop not fount");
            console.log("shop not fount");
            return res.status(200).json({
                success: false,
                message: "Shop Not Found",
            })
        }

        const product = await Product.create({
            productName,
            price,
            stock,
            discount,
            totalPrice,
            description,
            productImage: {
                url: data?.url,
                public_id: data?.public_id
            },
            shopRef
        });
        //    console.log("product",product);
        // Find the shop by ID


        // Add the product to the shop's products array
        shop.products.push(product._id);
        
        // Save the shop with the new product
        await shop.save();
        console.log("ok this is run ok success");
        console.log("ok this is run ok success");


        res.status(200).json({
            success: true,
            message: "Product created successfully",
            product
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        })
    }
}



export const getAllProductsOfAnyShop = async (req, res) => {
    try {

        const { shopid } = req.params

        const allProducts = await Product.find({
            shopRef: shopid
        })




        res.status(200).json({
            success: true,
            message: "All Products of Shop",
            allProducts
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Try again"
        })
    }
}



export const productDetails = async (req, res) => {
    try {

        const { productid } = req.params

        const product = await Product.findById(productid).populate('shopRef')
        res.status(200).json({
            success: true,
            message: "Product Details",
            product
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Try again"
        })
    }
}


export const updateProductDetails = async (req, res) => {
    try {

        const { productid } = req.params
        const product = await Product.findByIdAndUpdate(productid , req.body , {new:true}).populate('shopRef')

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Try again"
        })
    }
}



// ***************** TODO ******************
export const updateProductPictures = async (req, res) => {
    try {


        const { productid } = req.params
        const { productImage } = req.body
        console.log("product data",productImage , productid);
        //first find product 
        const product = await Product.findById(productid).populate('shopRef')

        if (product) {

            // delete existing image...
            if (product.productImage?.public_id) {
                await imageDestroy(product.productImage?.public_id)
            }
            // upload new image 
            const image = await imageUploader(productImage)
            // at last update product 
            const updateData = {
                'productImage.public_id': image?.public_id,
                'productImage.url': image?.url,
            };

            const updatedProduct = await Product.findByIdAndUpdate(productid,updateData, { new: true }).populate('shopRef');


            res.status(200).json({
                success: true,
                message: "All Products of Shop",
                product:updatedProduct
            })
        } else {
            res.status(400).json({
                success: true,
                message: "Product not found ",

            })

        }


    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Try again"
        })
    }


}




// ***************** TODO ******************
export const deleteProduct = async (req, res) => {
    try {

        const { productid } = req.params

        const product = await Product.findById(productid)
        if (product) {
            await imageDestroy(product?.productImage?.public_id)
            const shop = await Shop.findById(product?.shopRef)
            shop.products = shop.products.filter(ele => String(ele) !== String(productid))
            await shop.save({ validateBeforeSave: false })
            await Product.findByIdAndDelete(productid)

        }
        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product
        })
    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Try again"
        })
    }
}



