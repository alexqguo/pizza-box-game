import React, { PureComponent } from 'react';
import { fabric } from 'fabric';

window.fabric = fabric;
let canvas: fabric.Canvas | null = null;

export const getCanvas = () => canvas;

export default class Canvas extends PureComponent {
  componentDidMount() {
    canvas = new fabric.Canvas('c');
  }

  render() {
    console.log('Rendering the Canvas')
    return (
      <div>
        <canvas id="c" width="1000" height="700" style={{border: '1px solid gray'}}/>
      </div>
    );
  }
}

// export default () => {
//   const classes = useStyles();
//   const store = useContext(StoreContext);
//   const canvas = useContext(CanvasContext);

//   console.log(canvas);
  // useEffect(() => {
  //   const canvas = new fabric.Canvas('c');
  //   store.ruleStore.rules.forEach((r: Rule) => {
  //     canvas.loadFromJSON(r.data, () => {
  //       console.log('anything here?');
  //     });
  //   });
  // });

  // useEffect(() => {
  //   const canvas = new fabric.Canvas('c');
  //   const players = [{id: '0', name: 'zero'}, {id: '1', name: 'one'}];
  //   players.forEach((p: Player, i: number) => {
  //     const circle = new fabric.Circle({
  //       radius: 36,
  //       fill: '#ddd',
  //       originX: 'center',
  //       originY: 'center'
  //     });
      
  //     const text = new fabric.Text(p.name, {
  //       fontSize: 14,
  //       fontFamily: 'Roboto',
  //       originX: 'center',
  //       originY: 'center'
  //     });

  //     const group = new fabric.Group([circle, text], {
  //       left: 60 * (i + 1),
  //       top: 60 * (i + 1)
  //     });

  //     console.log(JSON.stringify(group));

  //     canvas.add(group);
  //   });
  // });

//   return useObserver(() => (
//     <div>
//       <canvas id="c" className={classes.canvas} width="1000" height="700" />
//     </div>
//   ));
// };