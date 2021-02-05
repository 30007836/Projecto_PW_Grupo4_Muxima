const express = require('express')
const router = express.Router()
const Category = require('../models/category')
const Place = require('../models/place')

//pesquisar as categorias na base de dados
router.get('/', async (req, res) => {    
    let searchOptions = {}
    if (req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const categories = await Category.find(searchOptions)
        res.render('categories/index', {
            categories: categories,
            searchOptions: req.query
        })
        console.log("Sucesso ao Pequisar")  
    } catch {
        res.redirect('/')
        console.log("Erro ao Pequisar")   
    }
})

//Pagina para adicionar categorias
router.get('/new', (req, res) => {
    res.render('categories/new', { category: new Category() })

})


//Criar nova categoria
router.post('/', async (req, res) => {

    //const newCategory = await Category.save()
    const category = new Category({
        name: req.body.name,
        description: req.body.description        
    })
    try {
        const newCategory = await category.save()
        res.redirect(`categories/${newCategory.id}`)
        //res.redirect('categories')
        console.log('Categoria Criada' ) 
    } catch {        
        res.render('categories/new', {
        category: category,
        errorMessage: 'Erro ao criar a categoria'          
        })
        
    }
})

//Show categorias
router.get('/:id', async (req, res) => {
    try {
      const category = await Category.findById(req.params.id)
      const places = await Place.find({ category: category.id }).limit(6).exec()
      res.render('categories/show', {
        category: category,
        placesByCategory: places
      })
    } catch (error) {
      res.redirect('/')
      //console.log(error)
    }
  })

  //editar categorias
  router.get('/:id/edit', async (req, res) => {
    try {
      const category = await Category.findById(req.params.id)
      res.render('categories/edit', { category: category })
    } catch {
      res.redirect('/categories')
    }
  })

  // update categoria
  router.put('/:id', async (req, res) => {
    let category
    try {
      category = await Category.findById(req.params.id)
      category.name = req.body.name
      await category.save()
      res.redirect(`/categories/${category.id}`)
    } catch {
      if (category == null) {
        res.redirect('/')
      } else {
        res.render('categories/edit', {
            category: category,
          errorMessage: 'Error updating Category'
        })
      }
    }
  })

  //delete categoria
  router.delete('/:id', async (req, res) => {
    let category
    try {
    category = await Category.findById(req.params.id)
      await category.remove()
      res.redirect('/categories')
    } catch (error) {
      if (category == null) {
        res.redirect('/')
      } else {
        res.redirect(`/categories/${category.id}`)
        console.log(error)
      }
    }
  })



module.exports = router