# consento-cards

This repository contains both the generator and reader user-interface used at https://consento.org/cards.

## Reader User Interface

The user-interface is powered by vue.js. You can simply use the

`./dist/consento-cards.min.js`

and copy the html code from the `./example.html` to adjust to your liking.


## Generate cards

You can quickly generate qr codes using...

`npx @consento/cards 2 3 dat://f05fb34728b53ced3258ce1ec8f4bdca25dbb908dc6a03667ba2dd72fc3d3bc8`

... which will split the dat link (`f05...`) into 3 parts, 2 of which are necessary to restore the
secret.

Complete usage:

```
consento-cards <threshold> <shares> <dat-hash> (<type>) (<folder>)

<threshold> ... number of codes necessary to restore the secret
<shares> ...... number of codes created
<dat-hash> .... secret to be hidden in the codes
[<type>] ...... type of the output code; one of: svg, png, jpg (defaults to svg)
[<folder>] .... folder to be used to output the codes. (defaults to './codes')
```

### License

MIT
