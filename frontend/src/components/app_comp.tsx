import React from 'react'
import { Link } from 'react-router-dom';


class AppTile extends React.Component<any,any> {
    
    render() {
        const style = {
            backgroundImage: `url(${this.props.image})`,
            backgroundSize: '250%',
            

          };
      return (
        
        
            <Link to={this.props.url} className='inline-block hover:scale-110 duration-100'>
                <div className=' flex-col w-56 h-60 items-center mt-3 relative rounded-lg overflow-hidden justify-center'>
                    <div className='flex-col mt-3 w-32 h-32 relative m-auto flex-1 '>
                        <img src={this.props.image} className="w-inherit h-32 block absolute z-10"></img>
                        <img src={this.props.image} className=' w-64 h-64 top-16 relative blur-3xl max-w-none block opacity-60 right-2/4' style= {style}></img>
                    </div>
                    
                    <div className='relative text-xl text-center top-4 font-serif text-white' style={{fontFamily: "Arial"}}>{this.props.desc}</div>
                </div>  
            </Link>
   
        
      );
    }
}


export default AppTile;