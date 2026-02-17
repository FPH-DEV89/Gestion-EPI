"use client"

import { useState } from "react"
import { QRCodeCanvas } from "qrcode.react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, QrCode } from "lucide-react"

export default function QRGeneratorPage() {
    const [url, setUrl] = useState("https://votre-app.vercel.app")
    const [size, setSize] = useState(300)

    const downloadQR = () => {
        const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement
        if (!canvas) return

        const pngFile = canvas.toDataURL("image/png")

        const downloadLink = document.createElement("a")
        downloadLink.download = "qr-code-stef-epi.png"
        downloadLink.href = pngFile
        downloadLink.click()
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                        <QrCode className="w-8 h-8 text-brand" />
                        Générateur QR Code STEF
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Créez un QR code personnalisé avec le logo STEF pour la demande d'EPI
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Configuration */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Personnalisez votre QR code</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    URL de destination
                                </label>
                                <Input
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://votre-app.vercel.app"
                                    className="bg-white dark:bg-gray-800"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    URL vers laquelle le QR code redirige (page de demande EPI)
                                </p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Taille (px)
                                </label>
                                <Input
                                    type="number"
                                    value={size}
                                    onChange={(e) => setSize(Number(e.target.value))}
                                    min={200}
                                    max={500}
                                    className="bg-white dark:bg-gray-800"
                                />
                            </div>

                            <Button
                                onClick={downloadQR}
                                className="w-full bg-brand hover:bg-brand/90"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Télécharger PNG
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Aperçu */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Aperçu</CardTitle>
                            <CardDescription>Votre QR code avec logo STEF</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center p-8">
                            <div className="bg-white p-6 rounded-xl shadow-lg">
                                <QRCodeCanvas
                                    id="qr-code-canvas"
                                    value={url}
                                    size={size}
                                    level="H"
                                    includeMargin={true}
                                    imageSettings={{
                                        src: "/logo-stef.png",
                                        x: undefined,
                                        y: undefined,
                                        height: size * 0.2,
                                        width: size * 0.2,
                                        excavate: true,
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">
                                Scannez ce QR code pour accéder à la demande d'EPI
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Instructions */}
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Instructions d'utilisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                1
                            </div>
                            <p>
                                <strong>Placez le logo STEF</strong> dans le dossier <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">public/logo-stef.png</code> de votre projet
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                2
                            </div>
                            <p>
                                <strong>Modifiez l'URL</strong> pour pointer vers votre page de demande EPI (ex: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">https://votre-app.vercel.app</code>)
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                3
                            </div>
                            <p>
                                <strong>Téléchargez le QR code</strong> en PNG et imprimez-le pour l'afficher à côté de vos armoires EPI
                            </p>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                                4
                            </div>
                            <p>
                                <strong>Scannez avec un smartphone</strong> pour accéder directement au formulaire de demande
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
