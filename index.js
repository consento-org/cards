
const Vue = require('vue/dist/vue.common.prod.js')
Vue.config.silent = true
Vue.config.productionTip = false
const sss = require('shamirs-secret-sharing')
const BrowserQRCodeReader = require('@zxing/library/esm5/browser/BrowserQRCodeReader').BrowserQRCodeReader

const codeSets = {}

function getOrCreateCodeSet (id, threshold, shares) {
  let codeSet = codeSets[id]
  if (codeSet) {
    return codeSet
  }
  codeSet = {
    id: id,
    threshold: threshold,
    shares: shares,
    codes: new Array(shares)
  }
  codeSets[id] = codeSet
  return codeSet
}

module.exports = function (node) {
  const config = {
    el: node,
    data: {
      flipped: false,
      error: null,
      scanner: null,
      missing: -1,
      scanned: -1,
      secret: null,
      activeCamera: null,
      cameras: [],
      codeSet: null,
      beaker: !!window.beaker,
      codes: []
    },
    mounted: function () {
      this.codeReader = new BrowserQRCodeReader()
      this.collectCameras()
    },
    watch: {
      activeCamera: function (camera) {
        if (/facing back/.test(camera.label)) {
          this.flipped = false
        } else {
          this.flipped = true
        }
        this.activateCamera()
      }
    },
    methods: {
      collectCameras: function () {
        const self = this
        this.codeReader
          .listVideoInputDevices()
          .then(function onCameras (cameras) {
            self.cameras = cameras
            if (!self.activeCamera) {
              self.activeCamera = cameras[0]
            }
          })
          .catch(function (err) {
            self.error = {
              code: 'NO CAMERA',
              err: err
            }
          })
      },
      activateCamera: function () {
        const cameraId = this.activeCamera && (this.activeCamera.id || this.activeCamera.deviceId)
        if (cameraId === this._cameraId) return
        this._cameraId = cameraId
        this.codeReader.stopStreams()
        if (!cameraId) return
        const self = this
        this.error = null
        this.codeReader.decodeFromInputVideoDeviceContinuously(
          cameraId,
          this.$refs.videoNode,
          function onScan (content) {
            if (content === null) {
              return
            }
            
            const buf = Buffer.from(content.text, 'base64')
            if (buf[0] !== 1) {
              return console.log('unexpected header')
            }
            
            const shares = buf[2]
            if (shares < 3) {
              return console.log('we need at least x of 3', shares)
            }
            
            const threshold = buf[1]
            if (threshold < 2) {
              return console.log('we need at lest 2 of ' + shares, threshold)
            }
            if (threshold >= shares) {
              return console.log('We need too many codes! Doesnt compute!', shares, threshold)
            }
            
            const current = buf[3]
            if (current >= shares) {
              return console.log('We have a code that is outside the bounds', shares, current)
            }
            
            const id = buf.slice(4, 10).toString('hex')
            if (!self.codeSet || self.codeSet.id !== id) {
              self.codeSet = getOrCreateCodeSet(id, threshold, shares)
              self.codes = self.codeSet.codes
            }

            self.codes[current] = buf.slice(10)

            const scanned = self.codes.reduce(function (cnt, code) {
              if (code) {
                return cnt + 1
              }
              return cnt
            }, 0)
            self.scanned = scanned
            const missing = Math.max(self.codeSet.threshold - scanned, 0)
            self.missing = missing

            try {
              self.secret = missing === 0
                ? sss.combine(self.codes.filter(Boolean)).toString('hex')
                : null
            } catch (e) {
              self.secret = null
            }
          }
        ).catch(err => {
          self.error = {
            code: 'BLOCKED',
            err: err
          }
        })
      }
    }
  }

  return new Vue(config) 
}
