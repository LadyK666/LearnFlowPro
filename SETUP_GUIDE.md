# My Day 项目设置与启动指南

欢迎加入 `My Day` 项目！本文档将引导您在本地计算机上快速、顺利地配置和运行本项目。

## 一、 基础环境准备

在开始之前，请确保您的电脑上已经安装了以下软件：

1.  **[Node.js](https://nodejs.org/)**: 请确保您的 Node.js 版本为 `v18.0` 或更高。
2.  **[pnpm](https://pnpm.io/installation)**: 我们项目使用的包管理器。如果尚未安装，请在终端中运行以下命令进行全局安装：
    ```bash
    npm install -g pnpm
    ```
3.  **[MySQL](https://dev.mysql.com/downloads/installer/)**: 本地数据库服务。请确保它已在您的电脑上安装并正在运行。您可以使用任何您喜欢的数据库管理工具（如 DBeaver, HeidiSQL, Navicat等）来管理它。

## 二、 首次项目启动步骤

请严格按照以下顺序执行操作：

### 第1步：克隆项目代码

打开您的终端，将项目代码从 Git 仓库克隆到本地。

```bash
# 将 [仓库地址] 替换为实际的 Git 仓库 URL
git clone [仓库地址]

# 进入项目根目录
cd my-day
```

### 第2步：安装项目所有依赖

在项目根目录 (`my-day/`) 下，运行一个命令即可同时安装前端和后端的所有依赖。

```bash
pnpm install -r
```
> ` -r ` 参数代表 `recursive`，它会自动找到工作区内的所有项目（前端和 `server/`）并为其安装依赖。

### 第3步：配置后端环境变量

这是最关键的一步，它将告诉后端服务如何连接到您本地的数据库。

1.  **进入后端目录**：
    ```bash
    cd server
    ```
2.  **创建本地环境文件**：
    在 `server/` 目录下，您会看到一个名为 `.env.example` 的模板文件。请复制该文件并重命名为 `.env`。
    *   在 Windows (PowerShell) 中： `copy .env.example .env`
    *   在 macOS / Linux 中： `cp .env.example .env`

3.  **编辑 `.env` 文件**：
    用您的代码编辑器打开刚刚创建的 `.env` 文件。您会看到以下内容：
    ```
    # 数据库连接字符串，请替换为本地的实际配置
    DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
    ```
    请将 `DATABASE_URL` 的值修改为您**本地 MySQL 数据库的真实连接字符串**。您需要替换 `USER`, `PASSWORD`, `HOST`, `PORT`, 和 `DATABASE`。

    **连接字符串示例：**
    ```
    # 假设您的MySQL用户名是 root，密码是 mysecretpass，数据库运行在本地默认端口3306，您想使用的数据库名叫 myday_db
    DATABASE_URL="mysql://root:mysecretpass@localhost:3306/myday_db"
    ```
    > **注意**: 如果名为 `myday_db` 的数据库尚不存在，下一步的命令会自动为您创建它。

### 第4步：运行数据库迁移

此步骤会根据您的 `.env` 文件配置，连接到数据库，并自动创建所有需要的表结构。

*   请确保您当前的终端目录依然在 `server/` 下。
*   运行以下命令：
    ```bash
    pnpm prisma migrate dev
    ```
*   首次运行时，它可能会提示您为这次迁移输入一个名称，您可以输入 `init` 然后按回车。

## 三、 运行开发服务器

现在项目已经配置完毕，我们需要**同时启动后端服务和前端服务**。这通常需要**两个独立**的终端窗口。

### 终端 1：启动后端服务

*   确保终端目录位于 `my-day/server/`。
*   运行命令：
    ```bash
    pnpm dev
    ```
*   当您看到类似 `Server is running on http://localhost:3000` 的输出时，代表后端已成功启动。请让此终端保持运行状态。

### 终端 2：启动前端服务

*   **打开一个新的终端窗口或标签页**。
*   进入项目**根目录** `my-day/`。
*   运行命令：
    ```bash
    pnpm dev
    ```
*   此命令会自动在您的默认浏览器中打开 `http://localhost:5173`。

---

恭喜！现在 `My Day` 项目已经在您的电脑上成功运行起来了。您可以访问 `http://localhost:5173`，注册一个新账号，然后开始使用和开发。

如果遇到任何问题，请随时与团队沟通。 