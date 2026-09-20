const equipmentService = require('../services/equipment.service')

class equipmentController{
    async getAllEquipment(req,res){
        const result = await equipmentService.list(req.valid.query)
        return res.json( {
            data: result.items,
            meta: {total: result.total, page: result.page, limit:result.limit}
        })
    }
   async createEquipment(req, res){
        const equipment = await equipmentService.create(req.valid.body)
        return res
        .status(201)
        .location(`/api/equipment/${equipment.id}`)
        .json({ data: equipment })
    }
    async getEquipment(req,res){
        const result = await equipmentService.getById(req.valid.params.id)
        return res.json( {
            data: result
        })
    }
    async updateEquipment(req,res){
        const result = await equipmentService.update(req.valid.params.id, req.valid.body)
        return res.json( {
            data: result
        })
    }
    async deleteEquipment(req,res){
       await equipmentService.remove(req.valid.params.id)
       return res.status(204).end()
    }
    async getByReqEquipment(req,res){
        const result = await equipmentService.listRequests(req.valid.params.id, req.valid.query)
        return res.json( {
            data: result.items,
            meta: {total: result.total, page: result.page, limit:result.limit}
        })
    }
    async getPredict(req,res){
        const result = await equipmentService.getWeather(req.valid.params.id)
        return res.json( {
            data: result
        })
    }
}
module.exports = new equipmentController()