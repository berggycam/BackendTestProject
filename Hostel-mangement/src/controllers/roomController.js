const roomModel=require('../models/roomModel.js');

const roomController={
    async getRooms(req,res){
        try{
            const rooms=await roomModel.getRooms()
            res.json(rooms);
        }catch(err){
            res.status(404).json({error: err.message});
        }
    
    },
    
    async getRoomById(req,res){
        try{
            const RoomById=await roomModel.getRoomById(req.params.id)
            res.json(RoomById);
        }catch(err){
            res.status(404).json({error: err.message});
        }
    },

    async createRoom(req,res){
        try{
            const createRoom=await roomModel.createRoom(req.body)
            res.json(createRoom);
        }catch(err){
            res.status(404).json({error: err.message});
        }
    }
}

module.exports=roomController;