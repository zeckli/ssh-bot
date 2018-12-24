<h1 align="center">
    ssh-bot
</h1>

<h4 align="center">
    A dummy ssh hosts management tool
</h4>

<p align="center">
    <img alt="ssh-bot" src="media/ssh-bot.png" />
</p>

<p align="center">
    <a href="https://cloud.drone.io">
        <img alt="Build Status" src="https://cloud.drone.io/api/badges/zeckli/ssh-bot/status.svg" />
    </a>
    <a href="https://github.com/prettier/prettier">
        <img alt="Code Style" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square" />
    </a>
</p>

## Description
`ssh-bot` is a dummy ssh hosts management tool that makes connectinng remote hosts and managing host information a little bit easier. :)

## Install
```
npm install -g ssh-bot
```

## Usage

### Initalize
To make ssh-bot work, you have to initialize it at the first time.
```
shb init
```

### Add host
After initialization, you can add hosts that you often connect to.
```
shb add
```

### Connect
To connect a host, you only need to `shb` with ssh additional options such as `-A` and `-p`.
```
shb -A -p 22
```
<p>
    <img alt="ssh-bot" src="media/ssh-bot-connect.png" />
</p>

### Edit host
You can always edit host information that you've added.
```
shb edit
```

### List hosts
See all hosts you've added.
```
shb list
```

### Remove host
Remove a host from hosts list.
```
shb remove
```

### Reset
If you want to remove all hosts, you could do a reset.
```
shb reset
```

### Help
Show help information about ssh-bot.
```
shb help
```

## License
[MIT](https://github.com/zeckli/ssh-bot/blob/develop/license.md)
