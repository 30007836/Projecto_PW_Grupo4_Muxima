const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Place = require('../models/place')
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/gif']
const { ensureAuthenticated, forwardAuthenticated } = require('../config/auth');



// Listar todos os Locais por nome e dada

router.get('/', async (req, res) => {
    let query = Place.find()
    if (req.query.name != null && req.query.name != '') {
      query = query.regex('name', new RegExp(req.query.name, 'i'))
    }   
    try {
      const places = await query.exec()
      res.render('places/index', {
        places: places,
        searchOptions: req.query
      })
    } catch {
      res.redirect('/')
    }
  })
  
  // Pagina novo Lugar
  router.get('/new', ensureAuthenticated, async (req, res) => {
    renderNewPage(res, new Place())
  })
  
  // Cria novo Place
  router.post('/', async (req, res) => {    
    const place = new Place({
      name: req.body.name,      
      address: req.body.address,
      description: req.body.description,
      province: req.body.province,
      category: req.body.category     
    })
    saveImage(place, req.body.mainImageName)

    try {
      const newPlace = await place.save()
      res.redirect(`places/${newPlace.id}`)
      //res.redirect('places')
      //console.log('Sucesso ao adicionar Lugar')
    } catch {
      renderNewPage(res, place, true)
      //console.log('Erro ao adicionar Lugar')
    }
  })

  // Show Place Route
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
                           .populate('category')
                           .exec()
    res.render('places/show', { place: place })
  } catch {
    res.redirect('/')
  }
})

// Edit Place Route
router.get('/:id/edit', ensureAuthenticated, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
    renderEditPage(res, place)
  } catch {
    res.redirect('/')
  }
})

// Update Place Route
router.put('/:id', ensureAuthenticated, async (req, res) => {
  let place

  try {
    place= await Place.findById(req.params.id)
    place.name = req.body.name,      
    place.address = req.body.address,
    place.description = req.body.description,
    place.province = req.body.province,
    place.category = req.body.category 
    if (req.body.mainImageName != null && req.body.mainImageName !== '') {
      saveImage(place, req.body.mainImageName)
    }
    await place.save()
    res.redirect(`/places/${place.id}`)
  } catch {
    if (place != null) {
      renderEditPage(res, place, true)
    } else {
      redirect('/')
    }
  }
})
     
 // Delete Place Page
 router.delete('/:id', ensureAuthenticated, async (req, res) => {
  let place
  try {
    place = await Place.findById(req.params.id)
    await place.remove()
    res.redirect('/places')
  } catch {
    if (place != null) {
      res.render('places/show', {
        place: place,
        errorMessage: 'Não pode remover o Local'
      })
    } else {
      res.redirect('/')
    }
  }
})


async function renderNewPage(res, place, hasError = false) {
  renderFormPage(res, place, 'new', hasError)
}

async function renderEditPage(res, place, hasError = false) {
  renderFormPage(res, place, 'edit', hasError)
}

async function renderFormPage(res, place, form, hasError = false) {
  try {
    const categories = await Category.find({})
    const params = {
      categories: categories,
      place: place
    }
    if (hasError) {
      if (form === 'edit') {
        params.errorMessage = 'Error Updating Book'
      } else {
        params.errorMessage = 'Error Creating Book'
      }
    }
    res.render(`places/${form}`, params)
  } catch {
    res.redirect('/places')
  }
}

  function saveImage(place, mainImageEncoded){
    if(mainImageEncoded == null){
      console.log("executou erro")
      return 
    } 
    const mainImage = JSON.parse(mainImageEncoded)
    if(mainImage != null && imageMimeTypes.includes(mainImage.type)){
      place.mainImageName = new Buffer.from(mainImage.data, 'base64')
      place.mainImageType = mainImage.type
      
    }
  }
  
  module.exports = router