import React from 'react';

class InputTag extends React.Component {
  constructor() {
    super();

    this.state = {
      tags: []
    };


    this.removeTag = this.removeTag.bind(this);
    this.inputKeyDown = this.inputKeyDown.bind(this);
  }

  componentDidMount(){
    
    if (this.props.tags != undefined){
      this.setState({tags: this.props.tags});
    }
  }

  removeTag(i) {
    const newTags = [...this.state.tags];
    newTags.splice(i, 1);
    this.setState({ tags: newTags });
    this.props.onTagChange(newTags);
  }

  inputKeyDown(e) {
    const val = e.target.value;
    if (e.key === 'Enter' && val) {
      if (this.state.tags.find(tag => tag.toLowerCase() === val.toLowerCase())) {
        return;
      }
      this.setState({ tags: [...this.state.tags, val] });
      this.props.onTagChange([...this.state.tags, val]);

      this.tagInput.value = null;
    } else if (e.key === 'Backspace' && !val) {
      this.removeTag(this.state.tags.length - 1);
    }
  }

  render() {
    const { tags } = this.state;

    return (
      <div className="logInEntry">
        <ul className="input-tag__tags">
          {tags.map((tag, i) => (
            <li className="logInEntry" key={tag}>
              {tag}
              <button type="button" onClick={() => { this.removeTag(i); }}>+</button>
            </li>
          ))}
          <li className="logInEntry"><input type="text" onKeyDown={this.inputKeyDown} ref={c => { this.tagInput = c; }} /></li>
        </ul>
      </div>
    );
  }
}

export default InputTag;