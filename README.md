# Canvas
Lightweight Infrastructure for Automation with HTML5 Canvas

The intent of this project is to enable configurable lightweight animation.

## Features
* Synchronization of animations and audio
* Animation speed matched to device refresh rate.
* 3D effects
  * Items in the distance move more slowly
  * With Move3D, item size increases or decreases as distance changes
  * Far items are occluded by nearer items.

## Operations
Configurations take advantage of a number of pre-defined operations
### HTML5 Canvas operations 
* **Background** (Provides unmoveable background for a scene)
* **Pan** (Movable background. Can wrap around)
* **Move** (Defines objects that exist in a plane at constant distance)
* **Bounce** (Like Move, but defines secondary motion within primary motion)
* **Move3D** (Allows the image to move in xyz space, with 3D effects)
* **Grid** (Places multiple images in fixed frame. Improved performance and ease of use.)
### Non-Canvas operations
* **Audio** (Play audio. Start, stop, and replay configurable)
* **Video** (Place a video on screen, play, loop, etc.)
* **Vimeo** (Same is video, but for Vimeo format)
* **SVG** (3D placement of SVG elements without Canvas)
  
  
