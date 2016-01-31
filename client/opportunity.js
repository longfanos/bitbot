var React = require('react'),
    hashHistory = require('react-router').hashHistory;

module.exports = React.createClass({
    getInitialState: function () {
        return {data: []};
    },

    componentDidMount: function () {
        this._updateState(this.props.location);
    },

    componentWillReceiveProps: function (nextProps) {
        this._updateState(nextProps.location)
    },

    _updateState: function (location) {
        var that = this;
        $.get(location.pathname, location.query, function (data) {
            that.setState({data: data});
        });
    },

    handleSubmit: function (e) {
        e.preventDefault();
        var form = e.target;
        var minProfit = form.min_profit.value;
        var limit = form.limit.value;
        hashHistory.push(this.props.location.pathname + '?min_profit=' + minProfit + '&limit=' + limit);
    },

    render: function () {
        return <div>
            <h1>Search for opportunities</h1>
            <SearchForm params={this.props.location.query} handleSubmit={this.handleSubmit} />
            <Table data={this.state.data} />
        </div>
    }
});

var SearchForm = React.createClass({
    render: function () {
        return <form onSubmit={this.props.handleSubmit}>
            <label>Min profit</label>
            <input name="min_profit" type="text" size="10" defaultValue={this.props.params.min_profit} />
            <label>Limit</label>
            <input name="limit" type='text' size="10" defaultValue={this.props.params.limit} />
            {/* TODO: onSubmit isn't triggered whithout if the form doesn't contain that button.
            I don't understand why... */}
            <input type="submit" value="send" />
        </form>
    }
})

var Table = React.createClass({
    render: function () {
        if (this.props.data.length == 0) {
            return <p>No results.</p>
        }

        var rows = this.props.data.map(function (r) {
            return <tr>
                <td>{r.Date}</td>
                <td>{r.Spread}%</td>
                <td>{r.BuyExchanger}</td>
                <td>{r.Ask.Price}</td>
                <td>{r.Ask.Volume}</td>
                <td>{r.SellExchanger}</td>
                <td>{r.Bid.Price}</td>
                <td>{r.Bid.Volume}</td>
            </tr>
        });

        return <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Spread</th>
                    <th colSpan="3">Buy</th>
                    <th colSpan="3">Sell</th>
                </tr>
            </thead>
            <tbody>
                {rows}
            </tbody>
        </table>
    }
});
