# consento-cards

This repository contains both the generator and reader user-interface used at https://consento.org/cards.

## Reader User Interface

The user-interface is powered by vue.js. You can simply use the

`./dist/consento-cards.min.js`

and copy the html code from the `./example.html` to adjust to your liking.


## Generate cards

To generate cards we have a 2 step process:

```
npx @consento/cards <action>

  <action> = init ..... to init the secrets necessary to retreive the codes
  <action> = create ... to create qr codes based on the secret
  
  Get more help for each action by adding --help or -h
```

First we need to create the parts created for the secret:

```
npx @consento/cards init 3 100 dat://ff05ebb2091766118717d78f58d1a19a19fbfa68796d1164f4d6a80f8dd4b2de`
```
 
This will create a `.json` file like `./codes/F127-2F66-CE58.json` which contains 100 partial secrets. Two of them
are needed to reveal our secret dat.

We can use this `.json` in our second step to generate the QR codes:

```
npx @consento/cards create ./codes/F127-2F66-CE58.json svg tanja martin daniel
```

This will assign 3 of the partial secrets to the 3 names: `tanja`, `martin` and `daniel` and
render 3 svg's looking like:

```
Writing ./codes/F127-2F66-CE58-tanja.svg
Writing ./codes/F127-2F66-CE58-martin.svg
Writing ./codes/F127-2F66-CE58-daniel.svg
```

You can use these to restore restore the dat link in the user interface.

### License

[MIT](./LICENSE)
