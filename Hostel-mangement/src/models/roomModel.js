
const roomModel={
    async getRooms(){
        try{
            const results= await Pool.query(
                `SELECT * FROM rooms`);
            return results
        }catch(err){
            res.status(404).json({error: err.message});
        }
    },

    async getRoomById(id){
        try{
            const results= await Pool.query(`SELECT * FROM rooms WHERE id=?`, [id]);
            const room = results.rows[0]; 

            if (!room) {
            throw new Error('Room not found');
            }

            return room;
            }catch(err){
            res.status(404).json({error: err.message});
        }
    },

    async createRoom(roomData){
        try{
            const {room_number, type, price, status}=roomData;
            const results= await Pool.query(
                `INSERT INTO rooms (room_number, type, price, status) VALUES (?, ?, ?, ?) RETURNING *`,
                [room_number, type, price, status]
            );
            return results;
        }catch(err){
            res.status(404).json({error: err.message});
        }
    }
    
}

module.exports=roomModel;