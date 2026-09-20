const requestService = require('../services/request.service')

class requestController{
    async getAllRequests(req,res){
        const result = await requestService.list(req.valid.query)
        return res.json( {
            data: result.items,
            meta: {total: result.total, page: result.page, limit:result.limit}
        })
    }
    async createRequest(req,res){
        const result = await requestService.create(req.valid.body)
        return res.status(201)
    }
    async getRequest(req,res){
        const result = await requestService.getById(req.valid.params.id)
        return res.json( {
            data: result
        })
    }
    async updateRequest(req,res){
        const result = await requestService.update(req.valid.params.id, req.valid.body)
        return res.json( {
            data: result
        })
    }
    async deleteRequest(req,res){
       await requestService.remove(req.valid.params.id)
       return res.status(204).end()
    }
    async changeStatus(req,res){
        const status = req.body.status
        const result = await requestService.changeStatus(req.valid.params.id, req.valid.body.status)
        return res.json( {
            data: result
        })
    }
}
module.exports = new requestController()